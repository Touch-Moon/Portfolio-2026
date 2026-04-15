// Delete legacy `category` documents (old unified Work/Story category type).
// Run:
//   DRY_RUN=1 npx sanity exec scripts/delete-legacy-categories.mjs --with-user-token
//   npx sanity exec scripts/delete-legacy-categories.mjs --with-user-token

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY_RUN = process.env.DRY_RUN === "1";

async function main() {
  const docs = await client.fetch(
    `*[_type == "category"]{_id, title, "slug": slug.current}`
  );
  console.log(`Found ${docs.length} legacy category documents.`);
  docs.forEach((d) => console.log(`  - ${d._id} (${d.title})`));

  if (!docs.length) return;

  // Safety: check if any doc still references them.
  const refs = await client.fetch(
    `*[references($ids)]{_id, _type}`,
    { ids: docs.map((d) => d._id) }
  );
  if (refs.length) {
    console.error(`\n⚠ ${refs.length} documents still reference legacy categories — aborting.`);
    refs.forEach((r) => console.error(`  ↳ ${r._type} / ${r._id}`));
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log(`\nDRY_RUN=1 — would delete ${docs.length} documents.`);
    return;
  }

  const tx = client.transaction();
  // Delete both published and draft variants.
  for (const d of docs) {
    tx.delete(d._id);
    tx.delete(`drafts.${d._id.replace(/^drafts\./, "")}`);
  }
  await tx.commit({ visibility: "async" }).catch((err) => {
    // Deleting a non-existent draft throws; surface only if it's something else.
    if (!/does not exist/.test(String(err.message))) throw err;
  });
  console.log(`\n✓ Deleted ${docs.length} legacy category documents.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
