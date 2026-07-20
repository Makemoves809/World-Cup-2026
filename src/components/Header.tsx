import { useEffect, useRef, useState } from "react";
import { navigate } from "../router";

interface HeaderProps {
  path: string;
}

/** Beginner-first navigation — the guide comes first. */
const PRIMARY = [
  { to: "/learn", label: "How it works" },
  { to: "/clubs", label: "Clubs" },
  { to: "/glossary", label: "Glossary" },
];

export function Header({ path }: HeaderProps) {
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!navOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        navRef.current &&
        !navRef.current.contains(t) &&
        toggleRef.current &&
        !toggleRef.current.contains(t)
      ) {
        setNavOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  useEffect(() => {
    setNavOpen(false);
  }, [path]);

  return (
    <header className="site-header">
      <a
        className="brand"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
      >
        <span className="brand-text">
          <span className="brand-mark">
            UCL<em>27</em>
          </span>
          <span className="brand-tag">Champions League · a beginner's guide</span>
        </span>
      </a>

      <button
        type="button"
        ref={toggleRef}
        className={`nav-toggle${navOpen ? " is-open" : ""}`}
        aria-label="Menu"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((o) => !o)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav
        className={`site-nav${navOpen ? " is-open" : ""}`}
        aria-label="Primary"
        ref={navRef}
      >
        {PRIMARY.map((l) => (
          <a
            key={l.to}
            href={l.to}
            className={path === l.to ? "nav-link is-active" : "nav-link"}
            aria-current={path === l.to ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigate(l.to);
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <span className="day-badge">2026/27</span>
    </header>
  );
}
