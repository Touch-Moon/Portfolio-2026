// Migrate legacy Story.category (string) → new Story.categories (references).
// Also a starting point for bulk-assigning categories to existing stories.
//
// Run:  npx sanity exec scripts/migrate-story-categories.mjs --with-user-token
//       DRY_RUN=1 npx sanity exec scripts/migrate-story-categories.mjs --with-user-token  (preview)

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

// Map old single string category → new storyCategory slug(s).
// Multiple slugs = multi-assign.
const LEGACY_MAP = {
  Insights: ["thoughts"],
  Process: ["case-study-note"],
  Technology: ["tooling-workflow"],
  Branding: ["thoughts"],
  Research: ["case-study-note"],
  Lab: ["code-snippet", "animation-interaction"],
};

// Optional: override per-story assignments by slug.
// These WIN over LEGACY_MAP if both match.
const OVERRIDES = {
  "canvas-ambient-bg": ["animation-interaction"],
  "3d-crystal-glass-shaders": ["animation-interaction"],
};

// Slugs to skip entirely (e.g. draft-only posts we don't want to patch).
const SKIP = new Set([
  "tech-innovation-effective-healthcare",
]);

const DRY_RUN = process.env.DRY_RUN === "1";

async function main() {
  const stories = await client.fetch(
    `*[_type == "story"]{_id, title, "slug": slug.current, category, categories}`
  );
  const cats = await client.fetch(
    `*[_type == "storyCategory"]{_id, "slug": slug.current}`
  );
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));

  console.log(`Found ${stories.length} stories · ${cats.length} storyCategory docs.\n`);

  const tx = client.transaction();
  let patched = 0;

  for (const s of stories) {
    if (SKIP.has(s.slug)) {
      console.log(`  ⊘ ${s.slug}: in SKIP list, skipping`);
      continue;
    }
    // Skip if already has categories set manually.
    if (Array.isArray(s.categories) && s.categories.length > 0) {
      console.log(`  · ${s.slug}: already has categories, skipping`);
      continue;
    }

    const slugs = OVERRIDES[s.slug] || LEGACY_MAP[s.category] || [];
    if (!slugs.length) {
      console.log(`  ? ${s.slug}: no mapping (category=${s.category || "∅"})`);
      continue;
    }

    const refs = slugs
      .map((slug) => catBySlug[slug])
      .filter(Boolean)
      .map((_id) => ({
        _type: "reference",
        _ref: _id,
        _key: Math.random().toString(36).slice(2, 10),
      }));

    if (!refs.length) continue;

    tx.patch(client.patch(s._id).set({ categories: refs }));
    patched++;
    console.log(`  → ${s.slug}: ${slugs.join(", ")}`);
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
  console.log(`\n✓ Patched ${patched} stories.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
