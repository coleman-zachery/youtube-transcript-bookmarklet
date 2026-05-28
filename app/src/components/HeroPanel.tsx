type HeroPanelProps = {
  bookmarkletLinkRef: React.RefObject<HTMLAnchorElement | null>;
  bookmarkletHandlers: {
    onBlur: () => void;
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    onDragEnd: () => void;
    onDragStart: () => void;
    onFocus: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
};

export function HeroPanel({
  bookmarkletLinkRef,
  bookmarkletHandlers,
}: HeroPanelProps) {
  return (
    <section className="hero">
      <div className="cta">
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
    </section>
  );
}
