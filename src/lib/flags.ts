/**
 * Country flags, bundled locally instead of fetched from a third-party CDN
 * at runtime — flagcdn.com was proving unreliable on real devices (showed up
 * as permanently-blank icons), so these SVGs (sourced from the MIT-licensed
 * flag-icons project, see src/assets/flags/LICENSE.txt) ship with the app.
 */
const modules = import.meta.glob("../assets/flags/*.svg", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const bySlug = new Map<string, string>();
for (const [path, url] of Object.entries(modules)) {
  const slug = path.slice(path.lastIndexOf("/") + 1, -4); // "../assets/flags/gb-eng.svg" -> "gb-eng"
  bySlug.set(slug, url);
}

/** Resolved asset URL for a flagcdn-style slug (e.g. "es", "gb-eng"), if bundled. */
export function flagUrl(slug: string | undefined): string | undefined {
  return slug ? bySlug.get(slug) : undefined;
}
