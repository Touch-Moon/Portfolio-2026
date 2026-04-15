import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const works = await client.fetch(
  `*[_type=="work"]|order(title asc){
    "slug": slug.current,
    title,
    excerpt,
    role,
    services,
    tools,
    tags,
    "categories": categories[]->{_type, "slug": slug.current, title}
  }`
);

const workCats = await client.fetch(
  `*[_type=="workCategory"]|order(title asc){"slug": slug.current, title}`
);

console.log("=== Available workCategory ===");
console.table(workCats);

console.log("\n=== Work documents ===");
for (const w of works) {
  console.log(`\n[${w.slug}] ${w.title}`);
  console.log(`  role: ${w.role || "-"}`);
  console.log(`  services: ${JSON.stringify(w.services || [])}`);
  console.log(`  tools: ${JSON.stringify(w.tools || [])}`);
  console.log(`  tags: ${JSON.stringify(w.tags || [])}`);
  console.log(`  current categories: ${JSON.stringify(w.categories || [])}`);
  if (w.excerpt) console.log(`  excerpt: ${w.excerpt.slice(0, 150)}`);
}
