import { navigate } from "../router";

interface HeaderProps {
  path: string;
}

const LINKS = [
  { to: "/groups", label: "Groups" },
  { to: "/knockout", label: "Knockout" },
  { to: "/fixtures", label: "Fixtures" },
  { to: "/form", label: "Form" },
  { to: "/qatar2022", label: "Qatar '22" },
];

const DAY_MS = 86_400_000;
const START = Date.UTC(2026, 5, 11);
const END = Date.UTC(2026, 6, 19) + DAY_MS;
const TOTAL_DAYS = 39;

export function Header({ path }: HeaderProps) {
  const now = Date.now();
  const live = now >= START && now < END;
  const day = Math.min(TOTAL_DAYS, Math.floor((now - START) / DAY_MS) + 1);

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
        {LINKS.map((l) => (
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
