import { getCliClient } from "sanity/cli";
const c = getCliClient({ apiVersion: "2025-01-01" });

const slugs = [
  "the-digital-challenge-of-the-industrial-sector",
  "wave-scroll",
  "canvas-ambient-bg",
];

for (const slug of slugs) {
  const s = await c.fetch(
    `*[_type=="story" && slug.current==$slug][0]{_id, "slug": slug.current, modules}`,
    { slug }
  );
  console.log("\n====", slug, s?._id);
  console.log(JSON.stringify(s.modules, null, 2));
}
