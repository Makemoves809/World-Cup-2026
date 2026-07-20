/**
 * Generates the subscribable calendar feed at public/champions-league.ics from
 * the CALENDAR data. Runs automatically before every build (npm `prebuild`),
 * so whenever the schedule changes the feed regenerates — and because a
 * calendar app re-fetches a subscribed feed periodically, subscribers get the
 * update automatically. Add real fixtures to CALENDAR (or a fixtures source)
 * after the draw and they'll flow straight into everyone's calendar.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CALENDAR } from "../src/data/learn";

// Bump when the feed's content meaningfully changes (keeps the file stable
// across rebuilds so it doesn't churn in git on every deploy).
const STAMP = "20260720T120000Z";
const DOMAIN = "champions-league-2026-27";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const plusDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

/** Fold long lines to 75 octets per RFC 5545 (continuation = CRLF + space). */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  let curBytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, "utf8");
    // 74 leaves room for the leading space on continuation lines.
    if (curBytes + b > 74) {
      out.push(cur);
      cur = ch;
      curBytes = b;
    } else {
      cur += ch;
      curBytes += b;
    }
  }
  if (cur) out.push(cur);
  return out.join("\r\n ");
}

const lines: string[] = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//UEFA Champions League 2026-27 hub//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "X-WR-CALNAME:UEFA Champions League 2026/27",
  "X-WR-CALDESC:Key dates for the 2026/27 UEFA Champions League. Auto-updates.",
  "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
  "X-PUBLISHED-TTL:PT12H",
];

for (const s of CALENDAR) {
  if (!s.date || s.noFeed) continue;
  const start = ymd(new Date(`${s.date}T00:00:00Z`));
  const endExclusive = ymd(plusDays(s.end ?? s.date, 1));
  const uid = `${s.stage.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}@${DOMAIN}`;
  lines.push(
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${STAMP}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${endExclusive}`,
    fold(`SUMMARY:Champions League: ${esc(s.stage)}`),
    fold(`DESCRIPTION:${esc(s.detail)}`),
    "TRANSP:TRANSPARENT",
    "END:VEVENT"
  );
}
lines.push("END:VCALENDAR");

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "..", "public", "champions-league.ics");
writeFileSync(out, lines.join("\r\n") + "\r\n", "utf8");
console.log(
  `Wrote ${out} (${CALENDAR.filter((s) => s.date && !s.noFeed).length} events).`
);
