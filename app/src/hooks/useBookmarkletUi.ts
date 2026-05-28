import { useEffect, useRef, useState } from 'react';
import { bookmarklet } from '../bookmarklet';

export function useBookmarkletUi() {
  const [isBookmarkletHovered, setIsBookmarkletHovered] = useState(false);
  const [isDraggingBookmarklet, setIsDraggingBookmarklet] = useState(false);
  const bookmarkletLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (bookmarkletLinkRef.current) {
      bookmarkletLinkRef.current.setAttribute('href', bookmarklet);
    }
  }, []);

  return {
    bookmarkletLinkRef,
    workspaceClassName: [
      'workspace',
      isBookmarkletHovered ? 'is-bookmarklet-hovered' : '',
      isDraggingBookmarklet ? 'is-dragging-bookmarklet' : '',
    ]
      .filter(Boolean)
      .join(' '),
    bookmarkletHandlers: {
      onBlur: () => {
        setIsBookmarkletHovered(false);
      },
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
      },
      onDragEnd: () => {
        setIsDraggingBookmarklet(false);
      },
      onDragStart: () => {
        setIsBookmarkletHovered(false);
        setIsDraggingBookmarklet(true);
      },
      onFocus: () => {
        setIsBookmarkletHovered(true);
      },
      onPointerEnter: () => {
        setIsBookmarkletHovered(true);
      },
      onPointerLeave: () => {
        setIsBookmarkletHovered(false);
      },
    },
  };
}
