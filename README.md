# agzalcazar.github.io

Personal academic website of **Antonio Giménez Alcázar** — PhD candidate in astrophysics at the Instituto de Astrofísica de Andalucía (IAA-CSIC), Granada.

Live at <https://agzalcazar.github.io>

## What it is

A static site. No build step, no dependencies, no framework.

```
index.html    content and structure
style.css     design system and responsive layout
script.js     theme toggle, star field, parallax, scroll reveals, active nav
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

### Adding a photo

Save a portrait as `portrait.jpg` in this folder. That is the whole step — the
page checks whether the file loads and only then shows the frame, so while the
file is absent the hero simply renders without it and no broken image appears.

Crop it roughly 4:5 (portrait); anything else is centre-cropped to fit. Around
800×1000 px is plenty — keep it under ~300 KB so the page stays fast.

To use a different filename or format, change the `src` on the `<img class="portrait">`
tag in `index.html`.

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
- All motion is disabled under `prefers-reduced-motion`.
- The FECYT CV PDF is deliberately **not** in this repository — it contains a
  national ID number and should not be published.
