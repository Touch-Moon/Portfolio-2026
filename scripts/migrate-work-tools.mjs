// Populate Work `tools` field (string array) per slug so the frontend
// can render the TechStack badge row.
//
// Run:
//   DRY_RUN=1 npx sanity exec scripts/migrate-work-tools.mjs --with-user-token
//   npx sanity exec scripts/migrate-work-tools.mjs --with-user-token

import { getCliClient } from "sanity/cli";
const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY_RUN = process.env.DRY_RUN === "1";

// Derived from each repo's package.json (dependencies + devDependencies),
// filtered down to meaningful brand-grade items. See commit message for rules:
//   - Next.js represents React (skip standalone React)
//   - Skip @types/*, eslint, lightningcss, sharp, lenis (scroll lib, too common)
//   - Pick one styling system when both Tailwind and styled-components coexist
const TOOLS = {
  "earth-strong-canada": ["Next.js", "TypeScript", "SCSS", "GSAP"],
  "homefield":           ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "GSAP"],
  "langill-farm":        ["Next.js", "TypeScript", "Sanity", "Framer Motion", "Resend", "Tailwind CSS"],
  "podcastville":        ["Next.js", "TypeScript", "SCSS", "GSAP"],
  "prarie-cricket-farm": ["Next.js", "TypeScript", "SCSS", "Supabase", "GSAP"],
  "seawater-portal":     ["Next.js", "TypeScript", "SCSS", "Supabase", "Framer Motion", "Leaflet"],
};

async function main() {
  const works = await client.fetch(
    `*[_type == "work"]{_id, "slug": slug.current, tools}`
  );
  const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));

  const tx = client.transaction();
  let patched = 0;

  for (const [slug, tools] of Object.entries(TOOLS)) {
    const doc = bySlug[slug];
    if (!doc) { console.warn(`⚠ unknown work slug: ${slug}`); continue; }
    tx.patch(client.patch(doc._id).set({ tools }));
    console.log(`→ ${slug}: ${tools.join(", ")}`);
    patched++;
  }

  if (DRY_RUN) {
    console.log(`\nDRY_RUN=1 — ${patched} patches prepared.`);
    return;
  }
  if (!patched) return console.log("Nothing to patch.");
  await tx.commit();
  console.log(`\n✓ Patched ${patched} Work documents.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
