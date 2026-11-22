import { GitHubIcon, LinkedInIcon, MoonIcon, SunIcon } from './Icons.jsx';

export function Navbar({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <header className="nav">
      <h1 className="brand">
        <span className="name">Terrell Finklea</span>
        <span className="sep" aria-hidden="true">
          ·
        </span>
        <span className="role">Senior Software Engineer</span>
        <span className="sep" aria-hidden="true">
          ·
        </span>
        <small className="role ">Building accessible, high-reliability web applications, UI architecture, and full-stack systems.</small>
      </h1>
      <div className="nav-actions">
        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
        <nav className="social" aria-label="Social">
          <a
            className="icon-button"
            href="http://www.linkedin.com/in/terrell-finklea-b7a457b6"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <a
            className="icon-button"
            href="https://github.com/terrell-merci"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
