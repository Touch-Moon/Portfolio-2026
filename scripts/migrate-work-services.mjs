// Replace the studio-templated "Services" array on each Published Work
// with a personal, project-specific 4-item list.
//
// Run:
//   DRY_RUN=1 npx sanity exec scripts/migrate-work-services.mjs --with-user-token
//   npx sanity exec scripts/migrate-work-services.mjs --with-user-token

import { getCliClient } from "sanity/cli";
const c = getCliClient({ apiVersion: "2025-01-01" });
const DRY_RUN = process.env.DRY_RUN === "1";

const SERVICES = {
  "langill-farm":        ["Brand & Motion", "UX & Interface", "CMS Architecture", "Next.js Build"],
  "prarie-cricket-farm": ["E-commerce UX", "Product Flow", "Interface Design", "Next.js Build"],
  "seawater-portal":     ["Multi-site UX", "Interface Design", "Data & Feeds", "Next.js Build"],
  "podcastville":        ["Discovery UX", "Editorial Design", "Interface & Motion", "Next.js Build"],
  "homefield":           ["Brand-led UX", "Editorial Layout", "Interface Design", "Next.js Build"],
  "earth-strong-canada": ["Brand Translation", "Interface Design", "Information Architecture", "Next.js Build"],
};

async function main() {
  const works = await c.fetch(`*[_type=="work"]{_id, "slug": slug.current}`);
  const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));

  const tx = c.transaction();
  let patched = 0;
  for (const [slug, services] of Object.entries(SERVICES)) {
    const doc = bySlug[slug];
    if (!doc) { console.warn(`⚠ ${slug} not found`); continue; }
    tx.patch(c.patch(doc._id).set({ services }));
    patched++;
    console.log(`→ ${slug}: ${services.join(", ")}`);
  }

  if (DRY_RUN) return console.log(`\nDRY_RUN=1 — ${patched} patches prepared.`);
  if (!patched) return console.log("Nothing to patch.");
  await tx.commit();
  console.log(`\n✓ Patched ${patched} Work documents.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
