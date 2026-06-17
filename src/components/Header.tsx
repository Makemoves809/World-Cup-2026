import { useEffect, useRef, useState } from "react";
import { navigate } from "../router";

interface HeaderProps {
  path: string;
}

/** Core tournament navigation — always visible. */
const PRIMARY = [
  { to: "/groups", label: "Groups" },
  { to: "/knockout", label: "Knockout" },
  { to: "/fixtures", label: "Fixtures" },
];

/** Analysis & archive — tucked under the "More" menu to keep the bar clean. */
const MORE = [
  { to: "/form", label: "Form table" },
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
  const moreRef = useRef<HTMLDivElement>(null);

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

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [path]);

  const go = (to: string) => {
    navigate(to);
    setOpen(false);
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

      <nav className="site-nav" aria-label="Primary">
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
