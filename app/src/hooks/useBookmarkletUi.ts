import { useEffect, useRef, useState } from 'react';
import { bookmarklet } from '../bookmarklet';

const TRANSPARENT_DRAG_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

type DragPosition = {
  left: number;
  top: number;
};

export function useBookmarkletUi() {
  const [isBookmarkletHovered, setIsBookmarkletHovered] = useState(false);
  const [isDraggingBookmarklet, setIsDraggingBookmarklet] = useState(false);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const bookmarkletLinkRef = useRef<HTMLAnchorElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragImageRef = useRef<HTMLImageElement | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const dragSurfaceCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (bookmarkletLinkRef.current) {
      bookmarkletLinkRef.current.setAttribute('href', bookmarklet);
    }
  }, []);

  useEffect(() => {
    dragImageRef.current = new Image();
    dragImageRef.current.src = TRANSPARENT_DRAG_IMAGE;

    return () => {
      dragSurfaceCleanupRef.current?.();
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
      }
    };
  }, []);

  const enableDragSurface = () => {
    if (dragSurfaceCleanupRef.current) {
      return;
    }

    document.body.classList.add('is-dragging-bookmarklet');

    const updateDragPosition = (event: DragEvent) => {
      if (event.clientX === 0 && event.clientY === 0) {
        return;
      }

      setDragPosition({
        left: event.clientX - dragOffsetRef.current.x,
        top: event.clientY - dragOffsetRef.current.y,
      });
    };

    const allowDragSurface = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    };

    window.addEventListener('dragover', updateDragPosition);
    window.addEventListener('drag', updateDragPosition);
    window.addEventListener('dragenter', allowDragSurface);
    window.addEventListener('dragover', allowDragSurface);
    window.addEventListener('drop', allowDragSurface);

    dragSurfaceCleanupRef.current = () => {
      document.body.classList.remove('is-dragging-bookmarklet');
      window.removeEventListener('dragover', updateDragPosition);
      window.removeEventListener('drag', updateDragPosition);
      window.removeEventListener('dragenter', allowDragSurface);
      window.removeEventListener('dragover', allowDragSurface);
      window.removeEventListener('drop', allowDragSurface);
      dragSurfaceCleanupRef.current = null;
    };
  };

  const clearDragState = () => {
    dragSurfaceCleanupRef.current?.();

    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    setIsDraggingBookmarklet(false);
    setDragPosition(null);
  };

  return {
    bookmarkletLinkRef,
    workspaceClassName: [
      'workspace',
      isBookmarkletHovered ? 'is-bookmarklet-hovered' : '',
      isDraggingBookmarklet ? 'is-dragging-bookmarklet' : '',
    ]
      .filter(Boolean)
      .join(' '),
    dragPreviewStyle: dragPosition
      ? {
          left: `${dragPosition.left}px`,
          top: `${dragPosition.top}px`,
        }
      : undefined,
    isDraggingBookmarklet,
    bookmarkletHandlers: {
      onBlur: () => {
        setIsBookmarkletHovered(false);
      },
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
      },
      onDragEnd: () => {
        clearDragState();
      },
      onDragStart: (event: React.DragEvent<HTMLAnchorElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        dragOffsetRef.current = {
          x: event.clientX - rect.left || rect.width / 2,
          y: event.clientY - rect.top || rect.height / 2,
        };
        setIsBookmarkletHovered(false);
        event.dataTransfer.effectAllowed = 'copy';
        if (dragImageRef.current) {
          event.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
        }
        enableDragSurface();

        dragFrameRef.current = window.requestAnimationFrame(() => {
          setDragPosition({
            left: rect.left,
            top: rect.top,
          });
          setIsDraggingBookmarklet(true);
          dragFrameRef.current = null;
        });
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
