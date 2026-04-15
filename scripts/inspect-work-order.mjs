import { getCliClient } from "sanity/cli";
const c = getCliClient({ apiVersion: "2025-01-01" });

const rows = await c.fetch(
  `*[_type == "work"] | order(order asc, title asc){
    "slug": slug.current,
    title,
    order,
    _updatedAt,
    _id,
    "published": !(_id in path("drafts.**"))
  }`
);

console.table(rows);
console.log(`\nTotal: ${rows.length}`);
