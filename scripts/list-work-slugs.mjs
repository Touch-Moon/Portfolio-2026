import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const rows = await client.fetch(
  `*[_type=="work"]|order(title asc){title,"slug":slug.current,externalUrl,siteUrl,githubUrl}`
);
console.table(rows);
console.log(`Total: ${rows.length} works`);
