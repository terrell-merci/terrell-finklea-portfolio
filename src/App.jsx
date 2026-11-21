import { useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { ProjectSegment } from './components/ProjectSegment.jsx';
import { SegmentRail } from './components/SegmentRail.jsx';
import { projects } from './projects.js';
import { useMedia } from './useMedia.js';

const COMPACT_QUERY = '(max-width: 819px)';
const GESTURE_LOCK_MS = 700;

function readTheme() {
  const stored = document.documentElement.dataset.theme;
  return stored === 'dark' ? 'dark' : 'light';
}

function wheelDelta(event) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

export default function App() {
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState(readTheme);
  const compact = useMedia(COMPACT_QUERY);
  const indexRef = useRef(0);
  const stageRef = useRef(null);

  const go = useCallback((next) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, next));
    if (clamped === indexRef.current) return;
    indexRef.current = clamped;
    setActive(clamped);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // Storage can be unavailable in private modes. The theme still applies.
    }
  }, [theme]);

  useEffect(() => {
    let locked = false;
    let unlockId = 0;

    const onWheel = (event) => {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      const delta = wheelDelta(event);
      if (Math.abs(delta) < Math.abs(event.deltaX) || Math.abs(delta) < 8) return;

      window.clearTimeout(unlockId);
      if (!locked) {
        locked = true;
        go(indexRef.current + (delta > 0 ? 1 : -1));
      }
      unlockId = window.setTimeout(() => {
        locked = false;
      }, GESTURE_LOCK_MS);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.clearTimeout(unlockId);
    };
  }, [go]);

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('.frame.is-interactive')) return;
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        go(indexRef.current + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        go(indexRef.current - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        go(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        go(projects.length - 1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let startY = null;

    const onStart = (event) => {
      if (event.touches.length !== 1) return;
      startY = event.touches[0].clientY;
    };

    const onEnd = (event) => {
      if (startY == null) return;
      const delta = startY - event.changedTouches[0].clientY;
      startY = null;
      if (Math.abs(delta) < 48) return;
      go(indexRef.current + (delta > 0 ? 1 : -1));
    };

    stage.addEventListener('touchstart', onStart, { passive: true });
    stage.addEventListener('touchend', onEnd);
    return () => {
      stage.removeEventListener('touchstart', onStart);
      stage.removeEventListener('touchend', onEnd);
    };
  }, [go]);

  const project = projects[active];

  return (
    <div className="app">
      <Navbar theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
      <main className="stage" ref={stageRef}>
        <p className="sr-only">
          Scroll, or use the up and down arrow keys, to move between projects. One project is shown
          at a time.
        </p>
        <div className="sr-only" aria-live="polite">
          {project.name}, project {active + 1} of {projects.length}
        </div>
        {projects.map((item, index) => (
          <ProjectSegment
            key={item.name}
            project={item}
            index={index}
            active={index === active}
            compact={compact}
            offset={index - active}
          />
        ))}
        <SegmentRail projects={projects} active={active} onGo={go} />
      </main>
    </div>
  );
}
