import { ChevronIcon } from './Icons.jsx';

export function SegmentRail({ projects, active, onGo }) {
  const last = projects.length - 1;

  return (
    <nav className="rail" aria-label="Projects">
      <button
        type="button"
        className="arrow"
        aria-label="Previous project"
        disabled={active === 0}
        onClick={() => onGo(active - 1)}
      >
        <ChevronIcon direction="up" />
      </button>
      <div className="dots">
        {projects.map((project, index) => (
          <button
            key={project.name}
            type="button"
            className="dot"
            aria-label={`Go to ${project.name}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => onGo(index)}
          />
        ))}
      </div>
      <button
        type="button"
        className="arrow"
        aria-label="Next project"
        disabled={active === last}
        onClick={() => onGo(active + 1)}
      >
        <ChevronIcon direction="down" />
      </button>
    </nav>
  );
}
