// Seed initial Work Categories and Story Categories
// Run:  npx sanity exec scripts/seed-categories.mjs --with-user-token
//
// Idempotent: safe to run multiple times. Existing docs with the same _id are skipped.

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const WORK_CATEGORIES = [
  "Branding",
  "Web Design",
  "Web Development",
  "UI/UX",
  "Mobile App",
  "Print/Graphic",
];

const STORY_CATEGORIES = [
  "Code Snippet",
  "Animation / Interaction",
  "Tutorial",
  "Case Study Note",
  "Tooling / Workflow",
  "Thoughts",
];

async function seed(type, titles) {
  const tx = client.transaction();
  for (const title of titles) {
    const slug = slugify(title);
    const _id = `${type}.${slug}`;
    tx.createIfNotExists({
      _id,
      _type: type,
      title,
      slug: { _type: "slug", current: slug },
    });
  }
  const res = await tx.commit();
  console.log(`  ✓ ${type}: ${titles.length} ensured (${res.results.length} ops)`);
}

async function main() {
  console.log("Seeding categories...");
  await seed("workCategory", WORK_CATEGORIES);
  await seed("storyCategory", STORY_CATEGORIES);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
