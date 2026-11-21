import { useEffect, useRef, useState } from 'react';
import { ExternalIcon } from './Icons.jsx';

const SLIDE_MS = 680;

function readBlank(frame) {
  try {
    const href = frame.contentWindow?.location?.href ?? '';
    return href === '' || href === 'about:blank';
  } catch {
    return false;
  }
}

export function ProjectFrame({ project, active }) {
  const iframeRef = useRef(null);
  const [phase, setPhase] = useState('idle');
  const [interactive, setInteractive] = useState(false);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (!active) {
      setInteractive(false);
      const timeout = window.setTimeout(() => {
        setVisible(false);
        setPhase('idle');
      }, SLIDE_MS);
      return () => window.clearTimeout(timeout);
    }

    const controller = new AbortController();
    setVisible(true);
    setInteractive(false);
    setPhase('checking');

    fetch(`/embed-check?url=${encodeURIComponent(project.url)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('check failed');
        return response.json();
      })
      .then((data) => {
        setPhase(data.embeddable === false ? 'blocked' : 'loading');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setPhase('loading');
      });

    return () => controller.abort();
  }, [active, project.url]);

  useEffect(() => {
    if (phase !== 'loading') return undefined;
    const timeout = window.setTimeout(() => setPhase('blocked'), 8000);
    return () => window.clearTimeout(timeout);
  }, [phase, project.url]);

  useEffect(() => {
    if (!interactive) return undefined;
    iframeRef.current?.focus();
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setInteractive(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interactive]);

  const onLoad = () => {
    const frame = iframeRef.current;
    if (!frame) return;
    setPhase(readBlank(frame) ? 'blocked' : 'ready');
  };

  const showEmbed = visible && (phase === 'loading' || phase === 'ready');
  const canInteract = phase === 'ready' && !interactive;

  return (
    <div
      className={`frame ${interactive ? 'is-interactive' : ''} ${canInteract ? 'is-ready' : ''}`}
      onClick={() => {
        if (canInteract) setInteractive(true);
      }}
    >
      {interactive && (
        <button type="button" className="frame-exit" onClick={() => setInteractive(false)}>
          Done
        </button>
      )}
      {showEmbed && (
        <iframe
          ref={iframeRef}
          src={project.url}
          title={`${project.name} live preview`}
          onLoad={onLoad}
          tabIndex={interactive ? 0 : -1}
          style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        />
      )}

      {active && (phase === 'checking' || phase === 'loading') && (
        <p className="frame-message">Loading preview…</p>
      )}

      {active && phase === 'blocked' && (
        <div className="frame-fallback">
          <p className="fallback-kicker">Preview unavailable</p>
          <p className="fallback-copy">{project.name} can’t be embedded in this page.</p>
          <a className="visit" href={project.url} target="_blank" rel="noreferrer">
            Visit {project.name}
            <ExternalIcon />
          </a>
        </div>
      )}

      {canInteract && (
        <button type="button" className="frame-hint">
          Click to interact
        </button>
      )}
    </div>
  );
}
