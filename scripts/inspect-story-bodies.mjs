// Dump all Story Portable Text bodies so we can spot code snippets
// that should be migrated to inline `code` decorators or `codeBlock` objects.

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const stories = await client.fetch(
  `*[_type == "story" && defined(slug.current)]|order(slug.current asc){
    _id, "slug": slug.current, title,
    "modules": modules[]{
      _key, _type,
      paddingTop, centered, heading,
      // Gather every text-carrying array, regardless of module variant.
      "body": body
    }
  }`
);

for (const s of stories) {
  console.log(`\n=== ${s.slug}  (${s._id})  ${s.title}`);
  (s.modules || []).forEach((m, i) => {
    if (!Array.isArray(m.body)) return;
    console.log(`  -- module[${i}] _type=${m._type} _key=${m._key} heading=${JSON.stringify(m.heading ?? null)}`);
    m.body.forEach((blk, j) => {
      if (blk?._type === "block") {
        const text = (blk.children || [])
          .map((c) => `${c.marks?.length ? `[${c.marks.join(",")}]` : ""}${c.text ?? ""}`)
          .join("");
        console.log(`     [${j}] block.${blk.style ?? "normal"} :: ${text}`);
      } else if (blk?._type === "codeBlock") {
        console.log(`     [${j}] codeBlock (already migrated) — ${blk.language} ${blk.filename ?? ""}`);
      } else {
        console.log(`     [${j}] ${blk?._type}`);
      }
    });
  });
}
