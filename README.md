# Threshold — Free LCAT & MACAT Admissions

A sample admissions landing page for free LCAT (law) and MACAT (medical) preparation courses.

Open `index.html` in a browser, or serve the folder with any static host (GitHub Pages works as-is).

## What's inside

- `index.html` — the page: hero, course cards, admission steps, application drawer, FAQ, footer.
- `css/tokens.css` — colours, spacing, radii and fonts from the design system (light and dark themes, following the visitor's system setting).
- `css/components.css` — reusable `th-` components: buttons, badges, panels, marquees, course cards, form fields, FAQ.
- `css/site.css` — layout for this page.
- `js/site.js` — application drawer, form validation, step carousel and scroll reveals. No dependencies.

## Application form (Formspree)

The application form sends to [Formspree](https://formspree.io). To switch it on:

1. Create a form at formspree.io and copy its ID (the part after `/f/` in the form's endpoint).
2. In `index.html`, replace `YOUR_FORM_ID` in the `<form action="https://formspree.io/f/YOUR_FORM_ID">` line with that ID.
3. Push. Submissions then arrive in your Formspree dashboard and by email.

While the placeholder is still there, the form works as a demo and sends nothing. Each submission includes the track, name, email, phone, current level, reason and reminder consent. A hidden `_gotcha` field catches spam bots.

Names, dates and figures on the page are illustrative.
