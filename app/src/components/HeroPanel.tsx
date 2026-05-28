type HeroPanelProps = {
  bookmarkletLinkRef: React.RefObject<HTMLAnchorElement | null>;
  dragPreviewStyle?: React.CSSProperties;
  isDraggingBookmarklet: boolean;
  bookmarkletHandlers: {
    onBlur: () => void;
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    onDragEnd: () => void;
    onDragStart: (event: React.DragEvent<HTMLAnchorElement>) => void;
    onFocus: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
};

export function HeroPanel({
  bookmarkletLinkRef,
  dragPreviewStyle,
  isDraggingBookmarklet,
  bookmarkletHandlers,
}: HeroPanelProps) {
  return (
    <section className="hero">
      <div className="cta">
        <div className="bookmarklet-slot">
          <div className={`bookmarklet-home ${isDraggingBookmarklet ? 'is-active' : ''}`} aria-hidden="true">
            <span>Drag to bookmarks bar</span>
          </div>

          <a
            ref={bookmarkletLinkRef}
            className="bookmarklet"
            id="bookmarklet-link"
            draggable="true"
            aria-describedby="bookmarklet-help"
            aria-label="Drag this bookmarklet to your bookmarks bar: Copy YT Transcript"
            href="#"
            {...bookmarkletHandlers}
          >
            ▶ Copy YT Transcript
          </a>
        </div>

        {isDraggingBookmarklet ? (
          <div className="bookmarklet bookmarklet--drag-preview" style={dragPreviewStyle} aria-hidden="true">
            ▶ Copy YT Transcript
          </div>
        ) : null}
      </div>
    </section>
  );
}
