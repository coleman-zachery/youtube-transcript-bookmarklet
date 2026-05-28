(async () => {
  const doc = document;
  const nav = navigator;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const query = (selector, root = doc) => root.querySelector(selector);
  const queryAll = (selector, root = doc) => [...root.querySelectorAll(selector)];
  const text = (node) => node?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const runtimeId = 'yt-transcript-copier-toast';
  const styleId = `${runtimeId}-style`;
  const homeUrl = 'https://coleman-zachery.github.io/youtube-transcript-bookmarklet/';
  let activeToast = null;
  let activeRunId = 0;
  const transcriptPanelSelectors = [
    'ytd-engagement-panel-section-list-renderer[target-id="PAmodern_transcript_view"]',
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]',
  ];

  const waitFor = async (getter, timeoutMs = 18000) => {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const value = typeof getter === 'function' ? getter() : query(getter);

      if (value) {
        return value;
      }

      await delay(140);
    }

    throw new Error('timeout');
  };

  const ensureStyle = () => {
    if (query(`#${styleId}`)) {
      return;
    }

    const style = doc.createElement('style');
    const reduceMotion = matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    style.id = styleId;
    style.textContent = `
      #${runtimeId} {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        width: min(360px, calc(100vw - 24px));
        padding: 16px 18px;
        border: 1px solid rgba(125, 146, 184, 0.2);
        border-radius: 0;
        background: rgba(11, 16, 30, 0.94);
        color: #f8fafc;
        box-shadow: 0 22px 56px rgba(0, 0, 0, 0.32);
        backdrop-filter: blur(18px);
        font: 500 14px/1.45 Inter, system-ui, sans-serif;
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
        transition: ${reduceMotion ? 'none' : 'opacity 180ms ease, transform 180ms ease'};
      }

      #${runtimeId}[data-visible="true"] {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      #${runtimeId}::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 3px;
        background: var(--toast-accent, #2ed3f6);
      }

      #${runtimeId}[data-tone="success"] {
        --toast-accent: #7dd3a6;
      }

      #${runtimeId}[data-tone="error"] {
        --toast-accent: #f97373;
      }

      #${runtimeId}[data-tone="loading"] {
        --toast-accent: #38bdf8;
      }

      .ytc-row {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 12px;
        align-items: start;
      }

      .ytc-icon {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: rgba(248, 250, 252, 0.08);
        border: 1px solid rgba(248, 250, 252, 0.08);
        display: grid;
        place-items: center;
        color: var(--toast-accent, #2ed3f6);
        font-size: 16px;
        font-weight: 700;
      }

      .ytc-kicker,
      .ytc-title,
      .ytc-detail,
      .ytc-subdetail {
        margin: 0;
      }

      .ytc-kicker {
        color: #7dd3fc;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .ytc-kicker-link {
        color: #7dd3fc;
        text-decoration: none;
      }

      .ytc-kicker-link:hover {
        text-decoration: underline;
      }

      .ytc-title {
        margin-top: 4px;
        color: #f8fafc;
        font-size: 16px;
        font-weight: 700;
      }

      .ytc-detail {
        margin-top: 4px;
        color: #cbd5e1;
      }

      .ytc-subdetail {
        margin-top: 8px;
        color: #9fb1cb;
        font-size: 13px;
        line-height: 1.45;
      }

      .ytc-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .ytc-action {
        border: 1px solid rgba(125, 146, 184, 0.26);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: #f8fafc;
        padding: 8px 12px;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }

      .ytc-action:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .ytc-action:focus-visible {
        outline: 2px solid rgba(56, 189, 248, 0.5);
        outline-offset: 2px;
      }

      .ytc-spinner {
        width: 15px;
        height: 15px;
        border: 2px solid rgba(255, 255, 255, 0.18);
        border-top-color: currentColor;
        border-radius: 999px;
        animation: ${reduceMotion ? 'none' : 'ytc-spin 900ms linear infinite'};
      }

      @keyframes ytc-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `;

    doc.head.append(style);
  };

  const isVisible = (node) =>
    !!node &&
    !node.hidden &&
    node.getAttribute('visibility') !== 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN' &&
    (node.offsetParent !== null || getComputedStyle(node).display !== 'none');

  const getTranscriptPanel = () =>
    transcriptPanelSelectors
      .flatMap((selector) => queryAll(selector))
      .find(isVisible) ||
    queryAll('ytd-engagement-panel-section-list-renderer').find((panel) => {
      if (!isVisible(panel)) {
        return false;
      }

      const title = text(
        query('#title-text, #title, h2[aria-label], [aria-label="Transcript"]', panel)
      ).toLowerCase();

      return title === 'transcript' || title.includes('transcript');
    }) ||
    null;

  const getTranscriptSegments = (panel) => {
    const modernSegments = queryAll('transcript-segment-view-model', panel);

    if (modernSegments.length) {
      return modernSegments.map((segment) => ({
        timestamp: text(
          query('.ytwTranscriptSegmentViewModelTimestamp, [class*="TranscriptSegmentViewModelTimestamp"]', segment)
        ),
        content: text(
          query('[role="text"], .ytAttributedStringHost, span', segment)
        ),
      }));
    }

    const legacySegments = queryAll('ytd-transcript-segment-renderer', panel);

    if (legacySegments.length) {
      return legacySegments.map((segment) => ({
        timestamp: text(query('.segment-timestamp', segment)),
        content: text(query('.segment-text', segment)),
      }));
    }

    return [];
  };

  const isYouTubeHost = () => {
    const host = window.location.hostname.toLowerCase();
    return (
      host === 'youtube.com' ||
      host.endsWith('.youtube.com') ||
      host === 'youtu.be' ||
      host.endsWith('.youtu.be')
    );
  };

  const isYouTubeWatchPage = () => {
    if (!isYouTubeHost()) {
      return false;
    }

    const path = window.location.pathname;
    return (
      path === '/watch' ||
      path.startsWith('/shorts/') ||
      hostAllowsEmbedTranscript(path)
    );
  };

  const hostAllowsEmbedTranscript = (path) =>
    path.startsWith('/embed/') || path.startsWith('/live/');

  const getVideoTitle = () => {
    const pageTitle = text(
      query('ytd-watch-metadata h1 yt-formatted-string, h1.ytd-watch-metadata')
    );

    if (pageTitle) {
      return pageTitle;
    }

    const ogTitle = doc
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content')
      ?.trim();

    if (ogTitle) {
      return ogTitle;
    }

    return doc.title.replace(/\s*-\s*YouTube\s*$/i, '').trim() || 'Video';
  };

  const sanitizeFilename = (value) =>
    value
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) || 'Video';

  const downloadTranscript = ({ title, transcriptText }) => {
    const blob = new Blob([transcriptText], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = doc.createElement('a');

    link.href = url;
    link.download = `YT Transcript — ${sanitizeFilename(title)}.txt`;
    link.style.display = 'none';
    doc.body.append(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const showToast = ({ tone, title, detail, subdetail = '', actions = [] }) => {
    ensureStyle();

    if (!activeToast) {
      const toast = doc.createElement('section');
      const row = doc.createElement('div');
      const icon = doc.createElement('div');
      const content = doc.createElement('div');
      const kicker = doc.createElement('p');
      const titleNode = doc.createElement('p');
      const detailNode = doc.createElement('p');
      const subdetailNode = doc.createElement('p');
      const actionsNode = doc.createElement('div');
      let timeoutId = 0;
      let detached = false;

      toast.id = runtimeId;
      row.className = 'ytc-row';
      icon.className = 'ytc-icon';
      kicker.className = 'ytc-kicker';
      titleNode.className = 'ytc-title';
      detailNode.className = 'ytc-detail';
      subdetailNode.className = 'ytc-subdetail';
      actionsNode.className = 'ytc-actions';

      row.append(icon, content);
      toast.append(row);
      doc.documentElement.append(toast);
      requestAnimationFrame(() => {
        toast.dataset.visible = 'true';
      });

      const onPointerDown = (event) => {
        if (!toast.contains(event.target)) {
          remove();
        }
      };

      const onKeyDown = (event) => {
        if (event.key === 'Escape') {
          remove();
        }
      };

      const remove = () => {
        if (detached) {
          return;
        }

        detached = true;
        clearTimeout(timeoutId);
        doc.removeEventListener('pointerdown', onPointerDown, true);
        doc.removeEventListener('keydown', onKeyDown, true);
        toast.remove();
        if (activeToast?.element === toast) {
          activeToast = null;
        }
      };

      const scheduleRemoval = (ms) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(remove, ms);
      };

      const clearRemoval = () => {
        clearTimeout(timeoutId);
      };

      doc.addEventListener('pointerdown', onPointerDown, true);
      doc.addEventListener('keydown', onKeyDown, true);

      activeToast = {
        actionsNode,
        content,
        clearRemoval,
        detailNode,
        element: toast,
        icon,
        kicker,
        remove,
        scheduleRemoval,
        subdetailNode,
        titleNode,
      };
    }

    const toast = activeToast.element;
    const {
      actionsNode,
      clearRemoval,
      content,
      detailNode,
      icon,
      kicker,
      subdetailNode,
      titleNode,
    } = activeToast;

    clearRemoval();
    toast.dataset.tone = tone;
    toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');

    icon.replaceChildren();
    if (tone === 'loading') {
      const spinner = doc.createElement('div');
      spinner.className = 'ytc-spinner';
      spinner.setAttribute('aria-hidden', 'true');
      icon.append(spinner);
    } else {
      const symbol = doc.createElement('span');
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = tone === 'success' ? '✓' : '!';
      icon.append(symbol);
    }

    const kickerLink = doc.createElement('a');
    kickerLink.className = 'ytc-kicker-link';
    kickerLink.href = homeUrl;
    kickerLink.target = '_blank';
    kickerLink.rel = 'noreferrer noopener';
    kickerLink.textContent = 'YT Transcript Copier ↗';

    kicker.replaceChildren(kickerLink);
    titleNode.textContent = title;
    detailNode.textContent = detail;
    subdetailNode.textContent = subdetail;
    actionsNode.replaceChildren();
    content.replaceChildren(kicker, titleNode, detailNode);

    if (subdetail) {
      content.append(subdetailNode);
    }

    if (actions.length) {
      actions.forEach((action) => {
        const button = doc.createElement('button');
        button.className = 'ytc-action';
        button.type = 'button';
        button.textContent = action.label;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          action.onClick();
        });
        actionsNode.append(button);
      });

      content.append(actionsNode);
    }

    return activeToast;
  };

  const closeTranscriptPanel = async () => {
    await delay(180);
    getTranscriptPanel()
      ?.querySelector('button[aria-label*="Close"], button[aria-label*="close"]')
      ?.click();
    query('#description-inline-expander #collapse')?.click();
  };

  const findTranscriptButton = () =>
    queryAll('button').find((button) => {
      const label = `${button.getAttribute('aria-label') || ''} ${text(button)}`.toLowerCase();

      return label.includes('transcript') && (label.includes('show') || label.includes('open'));
    });

  const collectTranscript = async () => {
    query('#description-inline-expander #expand')?.click();

    if (!getTranscriptPanel()) {
      const transcriptButton = await waitFor(findTranscriptButton, 12000);
      transcriptButton.click();
    }

    const panel = await waitFor(getTranscriptPanel, 16000);
    const segments = await waitFor(() => {
      const items = getTranscriptSegments(panel);
      return items.length ? items : null;
    });

    const entries = segments
      .map((segment) => {
        const timestamp = segment.timestamp || '';
        const content = segment.content || '';
        return {
          timestamp,
          line: [timestamp, content].filter(Boolean).join(' '),
        };
      })
      .filter((entry) => entry.line);

    const lines = entries
      .map((entry) => entry.line)
      .filter(Boolean);

    if (!lines.length) {
      throw new Error('missing-transcript-lines');
    }

    return {
      firstTimestamp: entries.find((entry) => entry.timestamp)?.timestamp || '',
      lastTimestamp: [...entries].reverse().find((entry) => entry.timestamp)?.timestamp || '',
      lines,
      text: lines.join('\n'),
    };
  };

  const copyToClipboard = async (value) => {
    const textarea = doc.createElement('textarea');

    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.inset = '0 auto auto 0';
    doc.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const execCommandSucceeded = doc.execCommand('copy');

    textarea.remove();

    if (execCommandSucceeded) {
      return;
    }

    try {
      if (nav.clipboard?.writeText) {
        await nav.clipboard.writeText(value);
        return;
      }
    } catch (_error) {
      // Fall through to the error below.
    }

    throw new Error('copy-failed');
  };

  const describeError = (error) => {
    switch (error?.message) {
      case 'not-youtube':
        return {
          detail: 'Open a YouTube video page first.',
          subdetail: '',
        };
      case 'not-video-page':
        return {
          detail: 'Use this on a YouTube video page.',
          subdetail: '',
        };
      case 'timeout':
        return {
          detail: 'YouTube did not expose transcript controls in time.',
          subdetail: 'Try again, or refresh the page and reopen the video.',
        };
      case 'copy-failed':
        return {
          detail: 'Clipboard access was blocked.',
          subdetail: 'Interact with the page, then try again.',
        };
      case 'missing-transcript-lines':
        return {
          detail: 'A transcript panel opened, but no transcript lines were available.',
          subdetail: '',
        };
      default:
        return {
          detail: 'This video may not expose a transcript.',
          subdetail: 'Try the latest bookmarklet.',
        };
    }
  };

  const run = async () => {
    activeRunId += 1;
    const runId = activeRunId;
    const attemptNumber = runId;

    if (!isYouTubeHost()) {
      const invalidSiteToast = showToast({
        tone: 'error',
        title: 'Not a YouTube page',
        detail: 'Open a YouTube video page first.',
        actions: [
          { label: 'Get bookmarklet', onClick: () => window.open(homeUrl, '_blank', 'noopener,noreferrer') },
        ],
      });

      invalidSiteToast.scheduleRemoval(9000);
      throw new Error('not-youtube');
    }

    if (!isYouTubeWatchPage()) {
      const invalidPageToast = showToast({
        tone: 'error',
        title: 'Open a video first',
        detail: 'Use this on a YouTube video page.',
        actions: [
          { label: 'Get bookmarklet', onClick: () => window.open(homeUrl, '_blank', 'noopener,noreferrer') },
        ],
      });

      invalidPageToast.scheduleRemoval(9000);
      throw new Error('not-video-page');
    }

    const slowTimerId = window.setTimeout(() => {
      if (runId !== activeRunId) {
        return;
      }

      showToast({
        tone: 'loading',
        title: 'Still collecting transcript',
        detail: 'YouTube is taking longer than usual.',
        subdetail: 'You can wait a little longer, try again, or refresh the page.',
        actions: [
          { label: 'Try again', onClick: () => void run() },
          { label: 'Refresh page', onClick: () => window.location.reload() },
        ],
      });
    }, 7000);

    showToast({
      tone: 'loading',
      title: 'Collecting transcript',
      detail: 'Opening the transcript panel and preparing text for copy.',
    });

    try {
      const transcript = await collectTranscript();
      const videoTitle = getVideoTitle();
      await copyToClipboard(transcript.text);

      if (runId !== activeRunId) {
        return transcript.text;
      }

      window.clearTimeout(slowTimerId);
      await closeTranscriptPanel();

      const successToast = showToast({
        tone: 'success',
        title: 'Transcript copied',
        detail:
          transcript.firstTimestamp && transcript.lastTimestamp
            ? `${transcript.lines.length} lines copied. ${transcript.firstTimestamp} - ${transcript.lastTimestamp}.`
            : `${transcript.lines.length} lines copied.`,
        actions: [
          {
            label: 'Download Transcript',
            onClick: () =>
              downloadTranscript({
                title: videoTitle,
                transcriptText: transcript.text,
              }),
          },
        ],
      });

      successToast.scheduleRemoval(12000);
      return transcript.text;
    } catch (error) {
      if (runId !== activeRunId) {
        throw error;
      }

      window.clearTimeout(slowTimerId);
      await closeTranscriptPanel();

      const failure = describeError(error);
      const failureToast = showToast({
        tone: 'error',
        title: 'Transcript unavailable',
        detail: failure.detail,
        subdetail:
          attemptNumber > 1 && isYouTubeHost()
            ? failure.subdetail || 'Try the latest bookmarklet.'
            : failure.subdetail,
        actions:
          attemptNumber > 1 && isYouTubeHost()
            ? [
                { label: 'Try again', onClick: () => void run() },
                { label: 'Refresh page', onClick: () => window.location.reload() },
                {
                  label: 'Update bookmarklet',
                  onClick: () =>
                    window.open(homeUrl, '_blank', 'noopener,noreferrer'),
                },
              ]
            : [
                { label: 'Try again', onClick: () => void run() },
                { label: 'Refresh page', onClick: () => window.location.reload() },
              ],
      });

      failureToast.scheduleRemoval(9000);
      throw error;
    }
  };

  await run();
})();
