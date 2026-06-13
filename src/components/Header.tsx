interface HeaderProps {
  active: string;
  onNavigate: (id: string) => void;
}

const LINKS = [
  { id: "groups", label: "Groups" },
  { id: "knockout", label: "Knockout" },
  { id: "fixtures", label: "Fixtures" },
];

const DAY_MS = 86_400_000;
const START = Date.UTC(2026, 5, 11);
const END = Date.UTC(2026, 6, 19) + DAY_MS;
const TOTAL_DAYS = 39;

export function Header({ active, onNavigate }: HeaderProps) {
  const now = Date.now();
  const live = now >= START && now < END;
  const day = Math.min(TOTAL_DAYS, Math.floor((now - START) / DAY_MS) + 1);

  return (
    <header className="site-header">
      <a
        className="brand"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("top");
        }}
      >
        <img
          className="brand-ball"
          src={`${import.meta.env.BASE_URL}ball.svg`}
          alt=""
          width={28}
          height={28}
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
          <button
            key={l.id}
            className={active === l.id ? "nav-link is-active" : "nav-link"}
            onClick={() => onNavigate(l.id)}
          >
            {l.label}
          </button>
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
