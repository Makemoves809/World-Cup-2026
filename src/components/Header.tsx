interface HeaderProps {
  active: string;
  onNavigate: (id: string) => void;
}

const LINKS = [
  { id: "groups", label: "Groups" },
  { id: "fixtures", label: "Fixtures" },
];

export function Header({ active, onNavigate }: HeaderProps) {
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
        <span className="brand-mark">WC</span>
        <span className="brand-year">26</span>
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

      <span className="host-strip" aria-label="Host nations">
        <span>🇨🇦</span>
        <span>🇲🇽</span>
        <span>🇺🇸</span>
      </span>
    </header>
  );
}
