/**
 * POST /api/contact
 *
 * Takes a contact form submission and emails it via Resend.
 *
 * The Resend API key never reaches the browser. It lives in a Vercel
 * environment variable and is only ever read here, on the server.
 *
 * Required environment variables (Vercel > Settings > Environment Variables):
 *   RESEND_API_KEY   your Resend key, starts with re_
 *   CONTACT_TO       where enquiries are delivered, e.g. hello@sachaesthetics.com.au
 *   CONTACT_FROM     the verified sender, e.g. Sach Aesthetics <website@sachaesthetics.com.au>
 */

const MAX = { name: 120, email: 200, phone: 60, topic: 80, message: 4000 };

function clean(value, limit) {
  return String(value == null ? '' : value).trim().slice(0, limit);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

module.exports = async function handler(req, res) {
  const body = req.body || {};
  // A browser with JavaScript posts JSON and wants JSON back. A browser
  // without it posts a normal form and needs to be sent somewhere.
  const wantsJson = String(req.headers['content-type'] || '').includes('application/json');

  const finish = (status, payload) => {
    if (wantsJson) return res.status(status).json(payload);
    const flag = status === 200 ? 'sent=1' : 'error=1';
    res.setHeader('Location', `/contact?${flag}`);
    return res.status(303).end();
  };

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return finish(405, { error: 'Method not allowed.' });
  }

  // Honeypot. Real people never see this field, so anything in it is a bot.
  // Answer with success so the bot has no signal to learn from.
  if (clean(body.company, 100)) {
    return finish(200, { ok: true });
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const phone = clean(body.phone, MAX.phone);
  const topic = clean(body.topic, MAX.topic);
  const message = clean(body.message, MAX.message);

  if (!looksLikeEmail(email)) {
    return finish(400, { error: 'Please enter a valid email address.' });
  }
  if (!message && !phone) {
    return finish(400, { error: 'Please add a message so I know how to help.' });
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.error('Contact form is missing environment variables.');
    return finish(500, { error: 'The form is not configured yet. Please email or DM instead.' });
  }

  const rows = [
    ['Name', name || 'Not given'],
    ['Email', email],
    ['Phone', phone || 'Not given'],
    ['About', topic || 'Not given']
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6F6862;font:500 12px system-ui;text-transform:uppercase;letter-spacing:.08em;vertical-align:top">${k}</td>` +
        `<td style="padding:6px 0;color:#423F3B;font:400 15px system-ui">${escapeHtml(v)}</td></tr>`
    )
    .join('');

  const html =
    `<div style="font-family:system-ui,sans-serif;max-width:560px">` +
    `<p style="font:500 12px system-ui;letter-spacing:.18em;text-transform:uppercase;color:#9C948C">New website enquiry</p>` +
    `<table style="border-collapse:collapse;margin-bottom:20px">${rows}</table>` +
    `<div style="border-top:1px solid #E4D8CC;padding-top:16px;color:#423F3B;font:400 15px/1.6 system-ui;white-space:pre-wrap">${
      escapeHtml(message) || '<em style="color:#9C948C">No message provided.</em>'
    }</div></div>`;

  const text =
    `New website enquiry\n\n` +
    `Name: ${name || 'Not given'}\nEmail: ${email}\nPhone: ${phone || 'Not given'}\n` +
    `About: ${topic || 'Not given'}\n\n${message || 'No message provided.'}`;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        // Hitting reply in the inbox replies to the client, not to the website
        reply_to: email,
        subject: `Website enquiry${topic ? ` - ${topic}` : ''}${name ? ` from ${name}` : ''}`,
        html,
        text
      })
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      console.error('Resend rejected the send:', resendRes.status, detail);
      return finish(502, { error: 'Could not send just now. Please try again shortly.' });
    }

    return finish(200, { ok: true });
  } catch (err) {
    console.error('Contact form failed:', err);
    return finish(502, { error: 'Could not send just now. Please try again shortly.' });
  }
};
