# NICE TRY — Interactive Object Archive

A single-page Three.js experiment that turns classic technology references into tactile, interactive web objects.

**Live site:** https://dreaminmaster.github.io/nicetry/

## Included scenes

- Classic Macintosh-inspired computer — tap the screen to cycle the interface
- Portable cassette player — tap the cassette to play/pause the reels
- Instant camera — tap the lens to fire the flash and eject a photo
- CRT television — tap the screen to tune between generated channels

The 3D objects are built from procedural geometry in the browser. The reference-image gallery uses Wikimedia Commons links and labels each image as a visual reference.

## Run locally

Because the page loads ES modules, serve the folder over HTTP:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

The workflow in `.github/workflows/pages.yml` deploys the repository to GitHub Pages on every push to `main`.
