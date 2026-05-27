# YouTube Transcript Copier

Local-first bookmarklet for copying YouTube transcripts without an extension, backend, or permissions prompt.

![YouTube Transcript Copier preview](./app/public/brandmark.svg)

## Why this exists

YouTube now blocks the old pattern of injecting remote scripts into video pages. This project keeps the bookmarklet fully inline so it remains compatible with modern Trusted Types and CSP restrictions.

## What you get

- Fully inline bookmarklet runtime
- No extension install flow
- No analytics, backend, or account
- Works from GitHub Pages
- Simple SVG branding with no asset-generation step

## Install

1. Open the published microsite.
2. Show your bookmarks bar with `Ctrl` + `Shift` + `B` on Chrome.
3. Drag `Copy Transcript` into the bookmarks bar.
4. Open a YouTube video page and click the bookmark.

## Local development

```bash
cd app
npm install
npm run dev
```

`npm run dev` regenerates the bookmarklet module before startup. The Vite plugin also rebuilds the generated bookmarklet whenever `app/public/youtube-transcript.js` changes.

## Build and deploy

```bash
cd app
npm run build
```

The GitHub Pages workflow installs dependencies in `app/`, builds the Vite app, and publishes `app/dist`.

## Architecture

- `app/public/youtube-transcript.js`
  The actual runtime that executes inside YouTube pages.
- `app/scripts/build-bookmarklet.mjs`
  Minifies the runtime, validates it, and writes `app/src/bookmarklet.ts`.
- `app/src/main.ts`
  Renders the microsite and injects the bookmarklet href into the primary CTA.

## Privacy

Transcript text never leaves the browser. The site has no backend, no tracking, and no extension permissions surface.
