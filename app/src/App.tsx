import { HeroPanel } from './components/HeroPanel';
import { NotesPanel } from './components/NotesPanel';
import { PrivacyLine } from './components/PrivacyLine';
import { useBookmarkletUi } from './hooks/useBookmarkletUi';

function App() {
  const {
    bookmarkletHandlers,
    bookmarkletLinkRef,
    workspaceClassName,
  } = useBookmarkletUi();

  return (
    <main className={workspaceClassName}>
      <section className="card">
        <h1>Copy YouTube Transcripts.</h1>

        <div className="content-row">
          <HeroPanel
            bookmarkletHandlers={bookmarkletHandlers}
            bookmarkletLinkRef={bookmarkletLinkRef}
          />
          <NotesPanel />
        </div>

        <PrivacyLine />
      </section>
    </main>
  );
}

export default App;
