// Convert hand-picked "Stack" text modules in Stories into the new
// `storyTechStack` module. Item lists are explicit per doc so we keep
// full control over the final labels.
//
// Run:
//   DRY_RUN=1 npx sanity exec scripts/migrate-story-stack.mjs --with-user-token
//   npx sanity exec scripts/migrate-story-stack.mjs --with-user-token

import { getCliClient } from "sanity/cli";
import { randomBytes } from "node:crypto";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY_RUN = process.env.DRY_RUN === "1";
const k = () => randomBytes(6).toString("hex");

function techStack({ heading = "Stack", items, paddingTop = 160 }) {
  return { _key: k(), _type: "storyTechStack", heading, items, paddingTop };
}

// docId → moduleKey → replacement module (or a function returning one)
const MUTATIONS = {
  // 3d-crystal-glass-shaders
  "c1875f94-9fef-46f2-b841-ff7c2d2ce4f6": {
    "1fcaf7269447": () =>
      techStack({
        heading: "Stack",
        items: [
          "React Three Fiber",
          "@react-three/drei",
          "@react-three/postprocessing",
          "maath",
          "Three.js",
          "Vite",
        ],
      }),
  },

  // canvas-ambient-bg
  "7b3659d1-48b1-4c58-bb32-19069f5c637d": {
    "87af5cc7d3df": () =>
      techStack({
        heading: "Stack",
        items: [
          "Canvas 2D API",
          "CSS Filter",
          "Vanilla ES Module",
          "React",
        ],
      }),
  },

  // wave-scroll
  "7uyMJuxQt2unjGflJEHAJ7": {
    "gkuahq6h": () =>
      techStack({
        heading: "Stack",
        items: [
          "React",
          "Three.js",
          "React Three Fiber",
          "@react-three/drei",
          "@react-three/flex",
          "@react-spring/web",
          "GLSL",
          "Create React App",
        ],
      }),
  },

  // breath-dear-medusae — "Built With" contains extra prose/credits so
  // we leave the text module in place and only prepend a TechStack
  // module above it. Handled separately below (INSERT_BEFORE).
};

// Insertions: docId → { beforeKey, module }
const INSERT_BEFORE = {
  "7uyMJuxQt2unjGflJEHALt": {
    // breath-dear-medusae — insert a TechStack above the "Built With"
    // text block (_key: r3fmo6nm) without touching the prose below.
    beforeKey: "r3fmo6nm",
    module: () =>
      techStack({
        heading: "Built with",
        items: [
          "Canvas 2D API",
          "JavaScript",
          "HTML",
        ],
      }),
  },
};

// ── Apply ─────────────────────────────────────────────────────────
async function main() {
  const tx = client.transaction();
  let mods = 0;
  let inserts = 0;

  // Replacements
  for (const [docId, modMap] of Object.entries(MUTATIONS)) {
    const doc = await client.getDocument(docId);
    if (!doc) { console.warn(`⚠ doc not found: ${docId}`); continue; }
    const modules = doc.modules || [];
    let changed = 0;
    const next = modules.map((m) => {
      const rep = modMap[m._key];
      if (!rep) return m;
      changed++;
      return rep(m);
    });
    if (!changed) { console.warn(`⚠ no matching module in ${docId}`); continue; }
    console.log(`→ ${docId}: replacing ${changed} module(s) with storyTechStack`);
    tx.patch(client.patch(docId).set({ modules: next }));
    mods += changed;
  }

  // Insertions
  for (const [docId, spec] of Object.entries(INSERT_BEFORE)) {
    const doc = await client.getDocument(docId);
    if (!doc) { console.warn(`⚠ doc not found: ${docId}`); continue; }
    const modules = doc.modules || [];
    const i = modules.findIndex((m) => m._key === spec.beforeKey);
    if (i < 0) { console.warn(`⚠ beforeKey ${spec.beforeKey} not found in ${docId}`); continue; }
    // Skip if a storyTechStack already sits right above.
    if (modules[i - 1]?._type === "storyTechStack") {
      console.log(`· ${docId}: storyTechStack already inserted — skip`);
      continue;
    }
    const next = [...modules.slice(0, i), spec.module(), ...modules.slice(i)];
    console.log(`→ ${docId}: inserting storyTechStack before ${spec.beforeKey}`);
    tx.patch(client.patch(docId).set({ modules: next }));
    inserts++;
  }

  if (DRY_RUN) {
    console.log(`\nDRY_RUN=1 — ${mods} replacements + ${inserts} insertions prepared.`);
    return;
  }
  if (!mods && !inserts) return console.log("Nothing to patch.");
  await tx.commit();
  console.log(`\n✓ ${mods} replacements + ${inserts} insertions applied.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
