import { ExternalIcon } from './Icons.jsx';
import { ProjectFrame } from './ProjectFrame.jsx';

export function ProjectSegment({ project, index, active, compact, offset }) {
  const headingId = `project-${index}-title`;

  return (
    <section
      className="segment"
      style={{ transform: `translateY(${offset * 100}%)` }}
      data-active={active ? 'true' : 'false'}
      aria-labelledby={headingId}
      aria-hidden={active ? undefined : true}
      inert={active ? undefined : true}
    >
      <div className="segment-inner">
        <div className="details">
          <h2 id={headingId} className="project-name">
            {project.name}
          </h2>
          <p className="summary">{project.summary}</p>
          <ul className="tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
        <div className="content">
          {compact ? (
            <a className="visit" href={project.url} target="_blank" rel="noreferrer">
              Visit {project.name}
              <ExternalIcon />
            </a>
          ) : (
            <div className="frame-slot">
              <ProjectFrame project={project} active={active} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
