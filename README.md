# barakadax.github.io

Personal portfolio site for Barak Taya — Software Engineer.

Live at **https://barakadax.github.io**.

## What's here

- `index.html` — hero, about, skills carousel, featured projects
- `projects.html` — full project catalog with language/status/tag filters, pulled live from the GitHub API
- `timeline.html` — career, certifications, education timeline
- `blog.html` — markdown articles scraped from the separate [`barakadax/blog`](https://github.com/barakadax/blog) repo
- `404.html` — custom not-found page

## Tech

Plain HTML, CSS, and vanilla JavaScript. No build step, no framework. Hosted on GitHub Pages.

External runtime dependencies (pulled from CDNs at page load):
- `css-doodle` — animated hero background
- `marked` + KaTeX + highlight.js — blog rendering

## Layout

```
css/       page and component stylesheets
js/        vanilla JS (menu, carousel, GitHub API client, etc.)
img/       icons, avatar, skill/project thumbnails
badges/    credential/certification images
projImg/   project screenshots
docs/      supporting material, including prior design history
```

## License

[MIT](LICENSE). Attribution appreciated; no warranty.
