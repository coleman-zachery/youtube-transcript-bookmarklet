import './style.css';
import { bookmarklet } from './bookmarklet';

const app = document.querySelector<HTMLDivElement>('#app');
const brandmarkUrl = `${import.meta.env.BASE_URL}brandmark.svg`;
const defaultInstallMessage =
  'Runs on YouTube video pages.';

if (!app) {
  throw new Error('Missing #app element');
}

app.innerHTML = `
  <main class="workspace">
    <section class="intro">
      <header class="brand">
        <img class="brandmark" src="${brandmarkUrl}" alt="" />
        <div>
          <p class="product-name">Transcript Copier</p>
          <p class="product-tag">Bookmarklet for YouTube</p>
        </div>
      </header>
      <h1>Copy transcripts in one click.</h1>
      <p class="lede">
        Drag one bookmark. Open a video. Copy the text.
      </p>
      <a
        class="bookmarklet"
        id="bookmarklet-link"
        draggable="true"
        aria-describedby="bookmarklet-help"
      >
        Copy Transcript
      </a>

      <p class="cta-note" id="bookmarklet-help" aria-live="polite">
        ${defaultInstallMessage}
      </p>
      <p class="trust">Local only. No extension. No permissions.</p>
    </section>
    <aside class="details" aria-label="Install instructions and details">
      <section class="detail-group">
        <h2>Install</h2>
        <ol class="steps">
          <li>Show the bookmarks bar with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>.</li>
          <li>Drag <span class="inline-accent">Copy Transcript</span> into the bar.</li>
          <li>Open a YouTube video, then click the bookmark.</li>
        </ol>
      </section>
      <section class="detail-group">
        <h2>Privacy</h2>
        <p class="detail-copy">
          Transcript text never leaves your browser.
        </p>
      </section>
    </aside>
  </main>
`;

const bookmarkletLink =
  app.querySelector<HTMLAnchorElement>('#bookmarklet-link');
const bookmarkletHelp =
  app.querySelector<HTMLParagraphElement>('#bookmarklet-help');

if (!bookmarkletLink || !bookmarkletHelp) {
  throw new Error('Missing bookmarklet UI');
}

const installHint = bookmarkletHelp;

bookmarkletLink.setAttribute('href', bookmarklet);
bookmarkletLink.setAttribute(
  'aria-label',
  'Drag this bookmarklet to your bookmarks bar: Copy Transcript'
);

function setInstallMessage(message: string, tone: 'idle' | 'hint' | 'live') {
  installHint.textContent = message;
  installHint.dataset.tone = tone;
}

bookmarkletLink.addEventListener('click', (event) => {
  event.preventDefault();
  setInstallMessage(
    'Drag this into your bookmarks bar.',
    'hint'
  );
});

bookmarkletLink.addEventListener('dragstart', () => {
  document.body.classList.add('is-dragging-bookmarklet');
  setInstallMessage(
    'Drop it into your bookmarks bar.',
    'live'
  );
});

bookmarkletLink.addEventListener('dragend', () => {
  document.body.classList.remove('is-dragging-bookmarklet');
  window.setTimeout(() => {
    setInstallMessage(defaultInstallMessage, 'idle');
  }, 900);
});
