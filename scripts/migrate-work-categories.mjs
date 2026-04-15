// Assign new workCategory references to existing Work documents by slug.
// Run:
//   DRY_RUN=1 npx sanity exec scripts/migrate-work-categories.mjs --with-user-token
//   npx sanity exec scripts/migrate-work-categories.mjs --with-user-token

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

// slug → array of workCategory slugs
const MAP = {
  // Published — my own Next.js builds: design + dev
  "earth-strong-canada": ["web-design", "web-development"],
  "homefield":           ["web-design", "web-development"],
  "langill-farm":        ["web-design", "web-development"],
  "podcastville":        ["web-design", "web-development"],
  "prarie-cricket-farm": ["web-design", "web-development"],
  "seawater-portal":     ["web-design", "web-development"],

  // Draft — past agency/studio work (UX/brand focused, kept for single-page reference)
  "nimble-payments":                       ["ui-ux", "branding"],
  "bsm":                                   ["branding", "ui-ux"],
  "desigual-digital-lookbook":             ["ui-ux", "web-design"],
  "iota":                                  ["ui-ux", "branding"],
  "massimo-dutti":                         ["branding", "ui-ux"],
  "strabe":                                ["branding", "ui-ux"],
  "hitachi-global-website":                ["web-design", "ui-ux"],
  "tech-innovation-effective-healthcare":  ["ui-ux"],
};

const DRY_RUN = process.env.DRY_RUN === "1";

async function main() {
  const works = await client.fetch(
    `*[_type=="work"]{_id, "slug": slug.current, categories}`
  );
  const cats = await client.fetch(
    `*[_type=="workCategory"]{_id, "slug": slug.current}`
  );
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));
  const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));

  console.log(`Found ${works.length} works · ${cats.length} workCategory docs.\n`);

  const tx = client.transaction();
  let patched = 0;

  for (const [slug, catSlugs] of Object.entries(MAP)) {
    const doc = bySlug[slug];
    if (!doc) {
      console.warn(`  ⚠ unknown work slug: ${slug}`);
      continue;
    }
    const refs = catSlugs
      .map((s) => catBySlug[s])
      .filter(Boolean)
      .map((_id) => ({
        _type: "reference",
        _ref: _id,
        _key: Math.random().toString(36).slice(2, 10),
      }));
    if (!refs.length) continue;

    tx.patch(client.patch(doc._id).set({ categories: refs }));
    patched++;
    console.log(`  → ${slug}: ${catSlugs.join(", ")}`);
  }

  if (DRY_RUN) {
    console.log(`\nDRY_RUN=1 — ${patched} patches prepared, not committed.`);
    return;
  }
  if (!patched) return console.log("Nothing to patch.");
  await tx.commit();
  console.log(`\n✓ Patched ${patched} work documents.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
