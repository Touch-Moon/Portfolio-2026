// Map siteUrl / githubUrl onto existing Work documents by slug.
// Run:  npx sanity exec scripts/migrate-work-links.mjs --with-user-token
//
// Edit the LINKS table below. Keys are Work slugs (check in Studio or run the
// helper query at the bottom of this file). Any field can be omitted.

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

// ────────────────────────────────────────────────────────────────────
// Edit this table — one entry per Work post.
// slug: (from Sanity) → { siteUrl?, githubUrl? }
// ────────────────────────────────────────────────────────────────────
const LINKS = {
  "earth-strong-canada": {
    siteUrl: "https://earthstrong-canada.vercel.app",
    githubUrl: "https://github.com/Touch-Moon/earthstrong-canada",
  },
  "homefield": {
    siteUrl: "https://homefield-marketing.vercel.app",
    githubUrl: "https://github.com/Touch-Moon/homefield-marketing",
  },
  "langill-farm": {
    siteUrl: "https://langill-farm.vercel.app",
    githubUrl: "https://github.com/Touch-Moon/langill-farm",
  },
  "podcastville": {
    siteUrl: "https://podcast-ville.vercel.app",
    githubUrl: "https://github.com/Touch-Moon/PodcastVille",
  },
  "prarie-cricket-farm": {
    siteUrl: "https://prairie-cricket-farms.vercel.app",
    githubUrl: "https://github.com/Touch-Moon/prairie-cricket-farms",
  },
  "seawater-portal": {
    siteUrl: "https://www.lobelia.earth",
    githubUrl: "https://github.com/Touch-Moon/seawater-portal",
  },
};

const DRY_RUN = process.env.DRY_RUN === "1";

async function main() {
  // Fetch all works with slugs so we can validate keys and warn on typos.
  const works = await client.fetch(
    `*[_type == "work"]{_id, title, "slug": slug.current, siteUrl, githubUrl}`
  );
  const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));

  console.log(`Found ${works.length} Work documents in Sanity.`);
  console.log(`Configured ${Object.keys(LINKS).length} link entries.\n`);

  const missing = Object.keys(LINKS).filter((s) => !bySlug[s]);
  if (missing.length) {
    console.warn("⚠ Unknown slugs (will be skipped):", missing);
  }

  const tx = client.transaction();
  let patched = 0;

  for (const [slug, { siteUrl, githubUrl }] of Object.entries(LINKS)) {
    const doc = bySlug[slug];
    if (!doc) continue;

    const patch = client.patch(doc._id);
    const set = {};
    if (siteUrl !== undefined) set.siteUrl = siteUrl;
    if (githubUrl !== undefined) set.githubUrl = githubUrl;

    if (Object.keys(set).length === 0) continue;

    patch.set(set);
    // Also unset the removed externalUrl field on the fly
    patch.unset(["externalUrl"]);
    tx.patch(patch);
    patched++;
    console.log(`  → ${slug}:`, set);
  }

  if (DRY_RUN) {
    console.log(`\nDRY_RUN=1 — ${patched} patches prepared, not committed.`);
    return;
  }

  if (!patched) {
    console.log("Nothing to patch.");
    return;
  }

  await tx.commit();
  console.log(`\n✓ Patched ${patched} Work documents.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/*
Helper: list all Work slugs with current links.
  npx sanity exec -f <<'JS' --with-user-token
    import { getCliClient } from "sanity/cli";
    const c = getCliClient({ apiVersion: "2025-01-01" });
    const rows = await c.fetch(`*[_type=="work"]|order(title asc){title,"slug":slug.current,siteUrl,githubUrl}`);
    console.table(rows);
  JS
*/
