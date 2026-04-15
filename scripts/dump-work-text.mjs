// Dump every text-carrying field on Published Works so we can copy-edit
// from a studio voice to a personal Design Engineer voice.

import { getCliClient } from "sanity/cli";
const c = getCliClient({ apiVersion: "2025-01-01" });

const works = await c.fetch(
  `*[_type=="work" && !(_id in path("drafts.**"))]|order(order asc){
    _id,
    title,
    "slug": slug.current,
    year,
    subtitle,
    overview,
    services,
    tools,
    "modules": modules[]{
      _type,
      _key,
      // textBlock fields
      heading,
      body,
      columnWidth,
      layout,
      centered,
      paddingTop
    }
  }`
);

for (const w of works) {
  console.log(`\n================ ${w.slug} (${w._id})`);
  console.log(`title    : ${w.title}`);
  console.log(`year     : ${w.year || "-"}`);
  console.log(`subtitle : ${w.subtitle || "-"}`);
  console.log(`services : ${JSON.stringify(w.services || [])}`);
  console.log(`tools    : ${JSON.stringify(w.tools || [])}`);
  console.log(`overview : ${w.overview || "-"}`);
  const texts = (w.modules || []).filter((m) => m._type === "textBlock");
  if (texts.length) {
    console.log(`text modules:`);
    texts.forEach((m, i) => {
      console.log(`  [${i}] _key=${m._key}  heading=${JSON.stringify(m.heading ?? null)}`);
      console.log(`      body: ${m.body ? m.body.slice(0, 400) : "-"}`);
    });
  }
}
