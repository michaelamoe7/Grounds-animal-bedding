# Grounds Animal Bedding — Website

The marketing website for Grounds: all-natural chicken coop bedding made from recycled coffee grounds.

It is a plain HTML/CSS site with no build step:

- `index.html` contains all the page content
- `styles.css` sets the colors, fonts and layout
- `thanks.html` is the page people see after sending the contact form
- `images/` holds the logos and photos

## Common edits

- **Retailer list:** in `index.html`, search for `EDIT: update this list`.
- **Social media links:** in `index.html`, search for `EDIT: replace #`.
- **Brand colors:** at the top of `styles.css`.

## Hosting

This site is set up for [Netlify](https://www.netlify.com/) (free plan). The contact form uses
Netlify Forms (`data-netlify="true"`). Netlify collects the submissions and can email them to you,
so your email address never appears on the site.

## Store map

The "Where to Buy" map reads `js/stores.js`, which is generated from the per-retailer lists in
`data/stores/`. To add or fix a store, edit the matching JSON file there, then run:

    python3 tools/build_stores.py

Sources (November 2026): each retailer's own store locator, plus All The Places
(alltheplaces.xyz) for Rural King, Bomgaars, Runnings, Fleet Farm and both Big R chains.
Theisen's is not on the map yet (`data/stores/theisens.json` is empty).
