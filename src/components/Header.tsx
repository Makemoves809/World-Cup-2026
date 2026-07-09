import { useEffect, useRef, useState } from "react";
import { navigate } from "../router";

interface HeaderProps {
  path: string;
}

/**
 * Core tournament navigation — always visible. The group stage is over, so the
 * bar leads with the knockouts; the final group tables live under "More".
 */
const PRIMARY = [
  { to: "/knockout", label: "Knockout" },
  { to: "/schedule", label: "Schedule" },
  { to: "/form", label: "Form table" },
];

/** Records & archive — tucked under the "More" menu to keep the bar clean. */
const MORE = [
  { to: "/groups", label: "Group tables" },
  { to: "/continuity", label: "Squad turnover" },
  { to: "/qatar2022", label: "Qatar 2022" },
];

const DAY_MS = 86_400_000;
const START = Date.UTC(2026, 5, 11);
const END = Date.UTC(2026, 6, 19) + DAY_MS;
const TOTAL_DAYS = 39;

export function Header({ path }: HeaderProps) {
  const now = Date.now();
  const live = now >= START && now < END;
  const day = Math.min(TOTAL_DAYS, Math.floor((now - START) / DAY_MS) + 1);

  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the mobile nav on outside click or Escape.
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

  // Close both menus whenever the route changes.
  useEffect(() => {
    setOpen(false);
    setNavOpen(false);
  }, [path]);

  const go = (to: string) => {
    navigate(to);
    setOpen(false);
    setNavOpen(false);
  };

  // "More" is active when viewing one of its pages, or any team squad map.
  const moreActive = MORE.some((l) => l.to === path) || path.startsWith("/squad");

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
        <img
          className="brand-ball"
          src={`${import.meta.env.BASE_URL}icon.png`}
          alt=""
          width={30}
          height={30}
        />
        <span className="brand-text">
          <span className="brand-mark">
            WC<em>26</em>
          </span>
          <span className="brand-tag">Canada · México · USA</span>
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

        <div className="nav-more" ref={moreRef}>
          <button
            type="button"
            className={`nav-link nav-more-btn${moreActive ? " is-active" : ""}`}
            aria-haspopup="true"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            More
            <span className={`nav-caret${open ? " is-open" : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>

          {open && (
            <div className="nav-menu" role="menu">
              {MORE.map((l) => (
                <button
                  key={l.to}
                  type="button"
                  role="menuitem"
                  className={`nav-menu-item${path === l.to ? " is-active" : ""}`}
                  onClick={() => go(l.to)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Flattened "More" links — shown only in the mobile nav panel */}
        {MORE.map((l) => (
          <a
            key={l.to}
            href={l.to}
            className={`nav-link nav-link--more${path === l.to ? " is-active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              go(l.to);
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <span className="day-badge">
        {live ? (
          <>
            <span className="day-dot" aria-hidden="true" />
            Day {day} of {TOTAL_DAYS}
          </>
        ) : (
          "Jun 11 – Jul 19, 2026"
        )}
      </span>
    </header>
  );
}
