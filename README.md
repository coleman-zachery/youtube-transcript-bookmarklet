# YouTube Transcript Copier

Copy YouTube transcripts with a bookmarklet.

Entirely local. No extensions. No sign-ups. No uploads.

## Install

Start here: [Open the bookmarklet page](https://coleman-zachery.github.io/youtube-transcript-bookmarklet/)

1. Show your bookmarks bar with `Ctrl` + `Shift` + `B`.
2. Drag `▶ Copy YT Transcript` into the bookmarks bar.
3. Open a YouTube video and click the bookmarklet.

## What It Does

- Copies transcript text from YouTube video pages
- Lets you download the transcript as a `.txt` file
- Runs entirely in your browser

## Privacy

Transcript text is only processed locally in your browser.

## Development

```bash
make
```

That runs the app from `app/`.

To build the static site:

```bash
cd app
npm run build
```
