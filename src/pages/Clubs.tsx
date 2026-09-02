import { clubsByCountry, confirmedClubs, CLUBS, type Club } from "../data/clubs";
import { flagUrl } from "../lib/flags";
import { initials } from "../data/squads";

function ClubCrest({ club, size = 30 }: { club: Club; size?: number }) {
  // No club crests yet — a tidy monogram token, with the national flag as a
  // small accent (mirrors the World Cup site's graceful photo fallback).
  return (
    <span className="club-crest" style={{ width: size, height: size }}>
      {initials(club.short)}
    </span>
  );
}

function CountryFlag({ flag }: { flag: string }) {
  const src = flagUrl(flag);
  if (!src) return null;
  return <img className="flag" src={src} width={21} height={14} alt="" aria-hidden="true" />;
}

function titleBadge(n: number): string {
  if (n === 0) return "No European Cups yet";
  return `${n}× European champion${n > 1 ? "s" : ""}`;
}

function ClubCard({ club }: { club: Club }) {
  return (
    <li className="club-card">
      <div className="club-card-head">
        <ClubCrest club={club} />
        <div className="club-id">
          <span className="club-name">{club.name}</span>
          <span className="club-meta">
            <CountryFlag flag={club.flag} /> {club.country} · {club.league}
          </span>
        </div>
        <span
          className={club.titles > 0 ? "club-titles has-titles" : "club-titles"}
          title={titleBadge(club.titles)}
        >
          {club.titles > 0 ? `${"★".repeat(Math.min(club.titles, 1))} ${club.titles}` : "—"}
        </span>
      </div>
      <p className="club-blurb">{club.blurb}</p>
      {club.watch && (
        <p className="club-watch">
          <span className="club-watch-tag">Watch</span> {club.watch}
        </p>
      )}
    </li>
  );
}

/** Club primers — who's in for 2026/27 and why a newcomer should care. */
export function Clubs() {
  const groups = clubsByCountry();
  const confirmed = confirmedClubs().length;
  const qualifying = CLUBS.filter((c) => c.status === "qualifying");

  return (
    <section className="clubs-page">
      <div className="section-head">
        <span className="kicker">Meet the field · 2026/27</span>
        <h2>The clubs</h2>
        <p className="section-note">
          All {confirmed} clubs are in — the draw was made on 27 August and the
          season begins on 8 September. Stars (★) mark past European champions —
          the number is how many times they've won it.
        </p>
      </div>

      {groups.map((g) => (
        <div className="club-country" key={g.country}>
          <h3 className="club-country-head">
            <CountryFlag flag={g.flag} /> {g.country}
            <span className="club-country-count">{g.clubs.length}</span>
          </h3>
          <ul className="club-grid">
            {g.clubs.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </ul>
        </div>
      ))}

      {qualifying.length > 0 && (
        <div className="club-country">
          <h3 className="club-country-head club-country-head--pending">
            Still in qualifying
            <span className="club-country-count">{qualifying.length}+</span>
          </h3>
          <p className="section-note club-pending-note">
            Not yet through, but names to know — the final qualifiers are set by
            26 August, then the draw on 27 August fills in the fixtures.
          </p>
          <ul className="club-grid">
            {qualifying.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
