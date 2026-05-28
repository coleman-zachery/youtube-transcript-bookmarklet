import { HeroPanel } from './components/HeroPanel';
import { NotesPanel } from './components/NotesPanel';
import { PrivacyLine } from './components/PrivacyLine';
import { useBookmarkletUi } from './hooks/useBookmarkletUi';

function App() {
  const githubIconUrl = `${import.meta.env.BASE_URL}github.svg`;
  const {
    bookmarkletHandlers,
    bookmarkletLinkRef,
    dragPreviewStyle,
    isDraggingBookmarklet,
    workspaceClassName,
  } = useBookmarkletUi();

  return (
    <>
      <a
        className="github-link"
        href="https://github.com/coleman-zachery/youtube-transcript-bookmarklet"
        target="_blank"
        rel="noreferrer noopener"
      >
        <img className="github-link__icon" src={githubIconUrl} alt="" aria-hidden="true" />
        <span>GitHub Public Repo ↗</span>
      </a>

      <main className={workspaceClassName}>
        <section className="card">
          <h1>Copy YouTube Transcripts</h1>

          <div className="content-row">
            <HeroPanel
              bookmarkletHandlers={bookmarkletHandlers}
              bookmarkletLinkRef={bookmarkletLinkRef}
              dragPreviewStyle={dragPreviewStyle}
              isDraggingBookmarklet={isDraggingBookmarklet}
            />
            <NotesPanel />
          </div>

          <PrivacyLine />
        </section>
      </main>
    </>
  );
}

export default App;
