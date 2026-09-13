# agzalcazar.github.io

Personal academic website of **Antonio Giménez Alcázar** — PhD candidate in astrophysics at the Instituto de Astrofísica de Andalucía (IAA-CSIC), Granada.

Live at <https://agzalcazar.github.io>

## What it is

A static site. No build step, no dependencies, no framework.

```
index.html    content and structure
404.html      shown for any unknown path
style.css     design system and responsive layout
script.js     theme toggle, star field, parallax, scroll reveals, active nav
images/       photos used in the hero, talks and outreach sections
.nojekyll     tells GitHub Pages to serve the files as-is
```

## Publishing it

Create a repository on GitHub named exactly `agzalcazar.github.io` — the name
is what makes it a user site served from the domain root.

Create it **completely empty**: no README, no .gitignore, no licence. If you tick
any of those boxes GitHub makes a commit of its own and the push below is
rejected as non-fast-forward.

Then:

```bash
git remote add origin https://github.com/agzalcazar/agzalcazar.github.io.git
git branch -M main
git push -u origin main
```

A user site publishes from the default branch automatically, so there is usually
nothing else to do — the first build takes a minute or two. If it does not appear,
check **Settings → Pages → Source → Deploy from a branch**, branch `main`,
folder `/ (root)`.

## Updating it

Edit `index.html` and push. Everything is plain HTML — publications, talks and
timeline entries are literal markup, so adding one means copying the block above
it and changing the text.

A new publication goes at the top of the `<ol class="pubs">` list:

```html
<li class="pub reveal">
  <span class="pub-year mono">2027</span>
  <div class="pub-body">
    <h3 class="pub-title">Title of the paper</h3>
    <p class="pub-meta"><b class="me">Giménez-Alcázar, A.</b>, Coauthor, B., et al. · <i>Journal</i> <b>vol</b>, page</p>
    <p class="pub-links"><a class="lnk" href="https://arxiv.org/abs/XXXX.XXXXX" target="_blank" rel="noopener">arXiv:XXXX.XXXXX</a></p>
  </div>
</li>
```

### Photos

They live in `images/`, already resized and stripped of EXIF (the originals from
WhatsApp can carry location data). `portrait.jpg` is the hero photo; the rest are
referenced from the Talks and Outreach sections.

To swap one, drop a replacement in `images/` under the same name, or add a new
`<figure class="shot">` block — copy an existing one and update `src`, `alt`,
`width`, `height` and the caption. The `width`/`height` attributes only reserve
layout space; the visible crop comes from `aspect-ratio` in `style.css`.

The portrait frame stays hidden until `portrait.jpg` actually loads, so a missing
file leaves no broken image.

### Changing the accent colour

One line in `style.css`. The green is tuned to [O III] λ5007; the hue is the
third number in the `oklch()` values under `:root` and `:root[data-theme="dark"]`.

## Local preview

```bash
python3 -m http.server 8000 --directory .
```

## Notes

- Dark and light themes follow the system setting and can be overridden with the
  toggle in the header; the choice persists in `localStorage`.
- Fonts are Newsreader, IBM Plex Sans and IBM Plex Mono, loaded from Google Fonts.
- The hero spectrum is drawn as inline SVG in `index.html`; it is a schematic of
  an extreme emission-line galaxy, not real data, and the caption says so.
- The star field is painted on a canvas from a fixed seed, so it looks the same
  on every visit. It drifts slowly and the stars scintillate; the loop only runs
  while the hero is on screen and stops in a background tab.
- The two themes render that field differently on purpose. Dark is the night
  sky: bright points on black. Light is a photographic plate — the negative an
  astronomer actually worked from — so the stars are dark on cream and the
  brighter ones burn a larger blob. A faded night sky on white just reads as an
  empty page.
- The headline rises a line at a time from behind a mask, the four J-PAS
  figures count up when scrolled into view, and a hairline at the top edge
  tracks reading progress.
- `style.css` and `script.js` are referenced with a `?v=` stamp. Bump it when
  you change either file, otherwise returning visitors keep the cached copy
  for up to ten minutes.
- Clicking any photograph opens it in a native `<dialog>`, which gives Escape,
  the focus trap and focus return without extra code. The paper figures are
  deliberately excluded: they link to their full-resolution file instead.
- Colours were checked against WCAG AA. `--ink-3` carries most of the small
  text and needed darkening in light and lightening in dark to clear 4.5:1;
  `--accent-solid` exists because white on `--accent` only reached 4.03:1.
- All motion is disabled under `prefers-reduced-motion`.
- The FECYT CV PDF is deliberately **not** in this repository — it contains a
  national ID number and should not be published. `.gitignore` excludes `*.pdf`.
- The 5 Sigma section has no link yet. When you have one, add it as a `.btn` or
  `.lnk` anchor inside that block in `index.html`.
