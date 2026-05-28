# YouTube Transcript Copier

[Open the bookmarklet page](https://coleman-zachery.github.io/youtube-transcript-bookmarklet/) · [GitHub Public Repo](https://github.com/coleman-zachery/youtube-transcript-bookmarklet)

Copy YouTube transcripts with a bookmarklet.

Entirely local. No extensions. No sign-ups. No uploads.

## Install

1. Open the [public site](https://coleman-zachery.github.io/youtube-transcript-bookmarklet/).
2. Show your bookmarks bar with `Ctrl` + `Shift` + `B`.
3. Drag `▶ Copy YT Transcript` into the bookmarks bar.
4. Open a YouTube video and click the bookmarklet.

## What It Does

- Copies transcript text from YouTube video pages
- Lets you download the transcript as a `.txt` file
- Runs entirely in your browser

## Privacy

Transcript text never leaves your browser.

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
