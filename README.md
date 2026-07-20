# Sach Aesthetics

A static website. No build step, no framework, no dependencies. Plain HTML, one CSS file, one small JS file. It deploys free on Vercel and costs nothing to run.

## Pages

| File | Live path | Replaces |
|---|---|---|
| `index.html` | `/` | sachaesthetics.com.au |
| `treatments.html` | `/treatments` | /pages/treatments |
| `facial-treatments.html` | `/facial-treatments` | /pages/facial-treatments |
| `chemical-peels.html` | `/chemical-peels` | /pages/chemical-peels |
| `microneedling.html` | `/microneedling` | /pages/microneedling |
| `lashes-brows.html` | `/lashes-brows` | /pages/lashes-brows |
| `location.html` | `/location` | /pages/location |
| `contact.html` | `/contact` | /pages/contact |
| `404.html` | any bad URL | — |

Booking is not a page. Every "Book" button links straight out to Fresha.

URLs have no `.html` extension. `cleanUrls` in `vercel.json` handles that, and Vercel redirects any old `.html` link to the clean version automatically. Keep the `.html` on the actual filenames; only the links drop it.

`vercel.json` already redirects the old Shopify `/pages/...` URLs to the new ones, so existing links and search results keep working.

---

## Before you go live: three things to do

### 1. Turn on the contact form

The form in `contact.html` needs somewhere to send messages. Free option, takes two minutes:

1. Go to [formspree.io](https://formspree.io) and create a free account.
2. Create a new form and copy the form ID it gives you (looks like `xdorbgqw`).
3. Open `contact.html`, find this line:
   ```html
   <form class="form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
4. Replace `YOUR_FORM_ID` with your ID and save.

The free tier allows 50 submissions a month. If you would rather not use a form at all, delete the `<form>` block and put your email address in the contact details list beside it.

### 2. Add your email address

There is no email address anywhere on the site yet because I did not have one. If you want it shown, add a row to the contact details in `contact.html`:

```html
<div class="kv__item">
  <p class="kv__key">Email</p>
  <p class="kv__val"><a href="mailto:hello@sachaesthetics.com.au">hello@sachaesthetics.com.au</a></p>
</div>
```

### 3. Check the Fresha link

Every booking button points to:
`https://www.fresha.com/a/sach-aesthetics-edwardstown-32-lindfield-avenue-c9ze8f2w`

If that ever changes, find and replace it across all the HTML files.

---

## Deploying

### Put it on GitHub

1. Create a new repository at [github.com/new](https://github.com/new). Call it `sach-aesthetics`. Leave it empty.
2. In a terminal, from this folder:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sach-aesthetics.git
git push -u origin main
```

If you would rather not use the terminal, GitHub Desktop does the same thing with buttons.

### Connect Vercel

1. Sign up at [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New > Project** and pick the `sach-aesthetics` repo.
3. Framework preset: **Other**. Build command: leave empty. Output directory: leave empty.
4. Click **Deploy**.

You get a live URL in about 20 seconds. From then on, every time you push a change to GitHub, Vercel republishes automatically.

### Point your domain at it

1. In Vercel, open the project, go to **Settings > Domains**, add `sachaesthetics.com.au` and `www.sachaesthetics.com.au`.
2. Vercel shows you the DNS records to create.
3. Go to wherever your domain is registered and enter those records. If the domain currently sits inside Shopify, you may need to move it to a registrar first, or update the records Shopify is managing.
4. Wait for propagation, usually under an hour.

Only cancel Shopify once the domain is resolving to Vercel and you have checked the site works.

---

## Making changes

Everything is editable in a plain text editor. No compiling.

**Change a price or treatment:** open the relevant page, find the block, edit the text.

```html
<div class="ledger__row" data-reveal>
  <div class="ledger__head">
    <span class="ledger__name">Lash Tint</span>
    <span class="ledger__leader" aria-hidden="true"></span>
    <span class="ledger__price">$20</span>
  </div>
  <p class="ledger__meta">10 minutes</p>
  <a class="ledger__book" href="...">Book this service</a>
</div>
```

Copy the whole block to add a new service. Delete it to remove one.

**Swap an image:** drop the new file into `assets/img/` and update the `src` in the HTML. Keep portraits around 980x1232 and banners around 1512x812 so they crop the same way.

**Change colours or fonts:** everything lives in the `:root` block at the top of `assets/css/style.css`.

```css
--bone:     #F3EEE8;   /* page background */
--shell:    #E4D8CC;   /* alternating band */
--ink:      #423F3B;   /* body text, footer, buttons */
--mulberry: #7C3B44;   /* prices, hover states, focus rings */
```

**Add a page:** copy an existing one, change the content in `<main>`, then add it to the nav in every file's header and drawer, plus the footer and `sitemap.xml`.

---

## Notes on the build

- **Address privacy.** The full street address appears nowhere in the visible content. The location page names the suburb only, the map is pinned to Edwardstown generally, and the copy says details are shared after booking. The Fresha URL does contain the street name, which is Fresha's own listing format and outside this site's control. Link text everywhere reads "Book on Fresha" rather than showing the URL.
- **Mobile.** Single column below 700px, a full screen menu behind the burger, and a booking button fixed to the bottom of the screen on every page so booking is always one tap away. It disappears on desktop, where the button sits in the header instead.
- **Accessibility.** Skip link, visible keyboard focus, labelled form fields, alt text on meaningful images, and all animation disabled for anyone who has reduced motion turned on.
- **Speed.** Two fonts from Google, roughly 20KB of CSS and JS combined, images lazy loaded below the fold. There is no JavaScript framework and nothing to wait for.
- **What was dropped.** The Shopify product catalogue, cart, customer accounts, the Miod skincare collection and the newsletter signup are all gone, since they were not on your list of pages to keep. If you want to sell skincare later, the cleanest route is a "Shop" link pointing at a separate storefront rather than rebuilding a cart here.

---

## Local preview

Double-clicking `index.html` mostly works, but the absolute paths behave better over a server:

```bash
cd sach-aesthetics
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
