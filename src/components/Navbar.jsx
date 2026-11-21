import { GitHubIcon, LinkedInIcon, MoonIcon, SunIcon } from './Icons.jsx';

export function Navbar({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <header className="nav">
      <h1 className="brand">
        <span className="name">John Doe</span>
        <span className="sep" aria-hidden="true">
          ·
        </span>
        <span className="role">Senior Front-End Engineer</span>
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
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <a
            className="icon-button"
            href="https://github.com"
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
