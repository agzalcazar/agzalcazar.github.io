# agzalcazar.github.io

Personal academic website of **Antonio Giménez Alcázar** — PhD candidate in astrophysics at the Instituto de Astrofísica de Andalucía (IAA-CSIC), Granada.

Live at <https://agzalcazar.github.io>

## What it is

A static site. Three files, no build step, no dependencies, no framework.

```
index.html    content and structure
style.css     design system and responsive layout
script.js     theme toggle, scroll reveals, active nav
```

## Publishing it

Create an empty repository on GitHub named exactly `agzalcazar.github.io`
(the name is what makes it a user site served from the domain root), then:

```bash
git remote add origin https://github.com/agzalcazar/agzalcazar.github.io.git
git branch -M main
git push -u origin main
```

Then in the repository: **Settings → Pages → Source → Deploy from a branch**,
branch `main`, folder `/ (root)`. The first build takes a minute or two.

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

Drop the image in the repository and add it inside `<div class="wrap hero-in">`:

```html
<img class="portrait" src="portrait.jpg" alt="Antonio Giménez Alcázar">
```

Then style it in `style.css` — the hero is a normal block layout, so a floated or
grid-placed portrait fits without touching anything else.

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
- The FECYT CV PDF is deliberately **not** in this repository — it contains a
  national ID number and should not be published.
