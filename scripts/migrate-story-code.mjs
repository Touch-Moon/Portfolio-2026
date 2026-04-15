// Rewrite specific Story modules so code-like fragments become
// inline `code` marks or standalone `codeBlock` objects.
//
// Target modules are hand-picked; see MUTATIONS below.
//
// Run:
//   DRY_RUN=1 npx sanity exec scripts/migrate-story-code.mjs --with-user-token
//   npx sanity exec scripts/migrate-story-code.mjs --with-user-token

import { getCliClient } from "sanity/cli";
import { randomBytes } from "node:crypto";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY_RUN = process.env.DRY_RUN === "1";

const k = () => randomBytes(6).toString("hex");

// ── Helpers to build Portable Text pieces ─────────────────────────
function span(text, marks = []) {
  return { _key: k(), _type: "span", marks, text };
}
function block(children, style = "normal") {
  return { _key: k(), _type: "block", style, markDefs: [], children };
}
function codeBlock({ language, code, filename }) {
  return {
    _key: k(),
    _type: "codeBlock",
    language,
    code,
    ...(filename ? { filename } : {}),
  };
}

// Split a body into runs, replacing literal `needle` (optionally with
// surrounding chars) inside unmarked spans. For our case we do manual
// block construction instead — see MUTATIONS.

// ── Target rewrites ───────────────────────────────────────────────
// Each entry replaces a single module in `modules[]` identified by _key.
// `build` returns the new module object (preserving settings from `m`).

const MUTATIONS = {
  // ——— the-digital-challenge-of-the-industrial-sector ———
  "7uyMJuxQt2unjGflJEHADZ": {
    "bfj3aluc": (m) => ({
      ...m,
      body: [
        block([
          span("The first real problem was shadows. "),
          span("MeshPhysicalMaterial", ["code"]),
          span(" with "),
          span("transmission > 0", ["code"]),
          span(" skips Three.js's depth pass entirely, so the slabs cast nothing on the floor. The fix is a "),
          span("customDepthMaterial", ["code"]),
          span(" on each mesh — forcing the renderer to write depth even for transmissive geometry."),
        ]),
        codeBlock({
          language: "js",
          code:
`mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking,
});`,
        }),
      ],
    }),
  },

  // ——— wave-scroll ———
  "7uyMJuxQt2unjGflJEHAJ7": {
    "cwv6g2ml": (m) => ({
      ...m,
      body: [
        block([
          span("The heart of the effect is a custom "),
          span("WaterPass", ["code"]),
          span(" post-processing pass. Inside the fragment shader, each pixel's UV is offset by a pair of sine/cosine waves driven by "),
          span("time", ["code"]),
          span(" and a dynamic "),
          span("factor", ["code"]),
          span(":"),
        ]),
        codeBlock({
          language: "text",
          filename: "GLSL — fragment shader",
          code:
`uv.x += 0.5 * amplitude * cos(uv.y * 4.0 + time * 0.7);
uv.y += 0.5 * amplitude * sin(uv.x * 4.0 + time * 0.3);`,
        }),
        block([
          span("When "),
          span("factor", ["code"]),
          span(" is zero the scene renders cleanly. As it grows, the screen distorts into rolling water — everything the camera sees, text and images included, inherits the wave."),
        ]),
      ],
    }),
  },

  // ——— canvas-ambient-bg ———
  "7b3659d1-48b1-4c58-bb32-19069f5c637d": {
    // "What the source revealed"
    "8842a8e7d300": (m) => ({
      ...m,
      body: [
        block([
          span("Digging into Apple Podcasts' bundled scene file ("),
          span("scene~7b5c360cee.js", ["code"]),
          span(") exposed the exact filter pipeline: a "),
          span("ColorMatrixFilter", ["code"]),
          span(" with saturation 2.75, brightness 0.7, contrast 1.9, followed by five sequential "),
          span("BlurFilters", ["code"]),
          span(" at 5/10/20/40/80 pixels, plus a "),
          span("ZoomBlur", ["code"]),
          span(" with a small rotation angle."),
        ]),
        block([
          span("The CSS "),
          span("filter", ["code"]),
          span(" property can't replicate every step — there's no native "),
          span("ZoomBlur", ["code"]),
          span(", and stacking five separate blurs would tank performance. But a single "),
          span("blur(60px)", ["code"]),
          span(" approximates the visual outcome closely enough that the difference disappears once a scrim is applied. Four numbers, one CSS line. That's the whole color treatment."),
        ]),
      ],
    }),
    // "Four sprites, four speeds"
    "06de8b11645e": (m) => ({
      ...m,
      body: [
        block([
          span("Rotation comes from drawing the artwork four times at slightly different positions and rotating each at its own speed. Because the canvas is heavily blurred, the sprite seams disappear into the haze — the eye reads it as one organic, slowly morphing surface, not as four discrete copies."),
        ]),
        block([
          span("Reduced-motion users get the same color treatment minus the rotation. The detection is a single "),
          span("matchMedia", ["code"]),
          span(" check; no extra code paths to maintain."),
        ]),
      ],
    }),
  },
};

// ── Apply ─────────────────────────────────────────────────────────
async function main() {
  let total = 0;
  const tx = client.transaction();

  for (const [docId, modMap] of Object.entries(MUTATIONS)) {
    const doc = await client.getDocument(docId);
    if (!doc) {
      console.warn(`⚠ doc not found: ${docId}`);
      continue;
    }
    const modules = doc.modules || [];
    let changed = 0;
    const nextModules = modules.map((m) => {
      const rewriter = modMap[m._key];
      if (!rewriter) return m;
      changed++;
      return rewriter(m);
    });
    if (!changed) {
      console.warn(`⚠ no matching modules in ${docId}`);
      continue;
    }
    console.log(`→ ${docId}: rewriting ${changed} module(s)`);
    tx.patch(client.patch(docId).set({ modules: nextModules }));
    total += changed;
  }

  if (DRY_RUN) {
    console.log(`\nDRY_RUN=1 — ${total} module rewrites prepared.`);
    return;
  }
  if (!total) {
    console.log("Nothing to patch.");
    return;
  }
  await tx.commit();
  console.log(`\n✓ Patched ${total} modules across ${Object.keys(MUTATIONS).length} documents.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
