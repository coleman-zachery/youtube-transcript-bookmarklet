(async () => {
  const doc = document;
  const nav = navigator;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const query = (selector, root = doc) => root.querySelector(selector);
  const queryAll = (selector, root = doc) => [...root.querySelectorAll(selector)];
  const text = (node) => node?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const runtimeId = 'yt-transcript-copier-toast';
  const styleId = `${runtimeId}-style`;
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
        border-radius: 18px;
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
        border-radius: 18px 0 0 18px;
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
      .ytc-detail {
        margin: 0;
      }

      .ytc-kicker {
        color: #7dd3fc;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
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

  const showToast = ({ tone, title, detail }) => {
    ensureStyle();

    query(`#${runtimeId}`)?.remove();

    const toast = doc.createElement('section');
    const row = doc.createElement('div');
    const icon = doc.createElement('div');
    const content = doc.createElement('div');
    const kicker = doc.createElement('p');
    const titleNode = doc.createElement('p');
    const detailNode = doc.createElement('p');

    toast.id = runtimeId;
    toast.dataset.tone = tone;
    toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');

    row.className = 'ytc-row';
    icon.className = 'ytc-icon';
    kicker.className = 'ytc-kicker';
    titleNode.className = 'ytc-title';
    detailNode.className = 'ytc-detail';

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

    kicker.textContent = 'Transcript Copier';
    titleNode.textContent = title;
    detailNode.textContent = detail;

    content.append(kicker, titleNode, detailNode);
    row.append(icon, content);
    toast.append(row);

    doc.documentElement.append(toast);
    requestAnimationFrame(() => {
      toast.dataset.visible = 'true';
    });

    let timeoutId = 0;
    let detached = false;

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
    };

    const scheduleRemoval = (ms) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(remove, ms);
    };

    doc.addEventListener('pointerdown', onPointerDown, true);
    doc.addEventListener('keydown', onKeyDown, true);
    toast.addEventListener('click', remove);

    return { remove, scheduleRemoval };
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
      return { usedFallback: true };
    }

    try {
      if (nav.clipboard?.writeText) {
        await nav.clipboard.writeText(value);
        return { usedFallback: false, prompted: true };
      }
    } catch (_error) {
      // Fall through to the error below.
    }

    throw new Error('copy-failed');
  };

  const describeError = (error) => {
    switch (error?.message) {
      case 'timeout':
        return 'YouTube did not expose transcript controls in time. Try reopening the transcript or refreshing the page.';
      case 'copy-failed':
        return 'Clipboard access was blocked. Try clicking the bookmark again after interacting with the page.';
      case 'missing-transcript-lines':
        return 'A transcript panel opened, but no transcript lines were available to copy.';
      default:
        return 'This video may not expose a transcript, or YouTube changed its transcript layout.';
    }
  };

  const loadingToast = showToast({
    tone: 'loading',
    title: 'Collecting transcript',
    detail: 'Opening the transcript panel and preparing text for copy.',
  });

  try {
    const transcript = await collectTranscript();
    const copyResult = await copyToClipboard(transcript.text);
    const rangeLabel =
      transcript.firstTimestamp && transcript.lastTimestamp
        ? ` ${transcript.firstTimestamp} - ${transcript.lastTimestamp}.`
        : '';

    loadingToast.remove();
    await closeTranscriptPanel();

    const successToast = showToast({
      tone: 'success',
      title: 'Transcript copied',
      detail: `${transcript.lines.length} lines copied.${rangeLabel}${copyResult.usedFallback ? ' Copied without a browser permission prompt.' : ' Copied to your clipboard.'}`,
    });

    successToast.scheduleRemoval(4200);
    return transcript.text;
  } catch (error) {
    loadingToast.remove();
    await closeTranscriptPanel();

    const failureToast = showToast({
      tone: 'error',
      title: 'Transcript unavailable',
      detail: describeError(error),
    });

    failureToast.scheduleRemoval(7200);
    throw error;
  }
})();
