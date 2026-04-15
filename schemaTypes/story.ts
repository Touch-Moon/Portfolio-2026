import { defineType, defineField } from "sanity";

// ── Story / Insight Module Object Types ──────────────────────────────
// Aligned with frontend StorySingle component (storyMediaBlock / storyTextBlock / storySpacerBlock)

// Media Block — 1/2/3 column image/video grid
const storyMediaBlock = defineType({
  name: "storyMediaBlock",
  title: "Media Block",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      title: "Layout (Frame)",
      type: "string",
      options: {
        list: [
          { title: "1 Column (2688px)",                      value: "1col" },
          { title: "2 Columns — Equal (1340px each)",        value: "2col" },
          { title: "2 Columns — Narrow:Wide (900 / 1800px)", value: "2col-narrow-wide" },
          { title: "2 Columns — Wide:Narrow (1800 / 900px)", value: "2col-wide-narrow" },
          { title: "3 Columns (900px each)",                 value: "3col" },
        ],
        layout: "radio",
      },
      initialValue: "1col",
    }),
    defineField({
      name: "spacing",
      title: "Gap Spacing",
      type: "string",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Tight",   value: "tight" },
          { title: "None",    value: "none" },
          { title: "No Gap",  value: "no-gap" },
        ],
      },
      initialValue: "default",
    }),
    defineField({
      name: "fullBleed",
      title: "Full Bleed (no side padding)",
      type: "boolean",
      description: "OFF → Guttered (2688px) / ON → Full Bleed (2560px)",
      initialValue: false,
    }),
    defineField({
      name: "narrow",
      title: "Narrow Layout (Reduce Height)",
      type: "boolean",
      initialValue: false,
      description: "1col only. Reduces vertical ratio.",
      hidden: ({ parent }) => parent?.layout !== "1col",
    }),
    // Slot 1
    defineField({
      name: "image1",
      title: "Image 1",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "video1",
      title: "Video 1 (overrides Image 1)",
      type: "file",
      options: { accept: "video/*" },
    }),
    // Slot 2
    defineField({
      name: "image2",
      title: "Image 2",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => !parent?.layout || parent.layout === "1col",
    }),
    defineField({
      name: "video2",
      title: "Video 2 (overrides Image 2)",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => !parent?.layout || parent.layout === "1col",
    }),
    // Slot 3
    defineField({
      name: "image3",
      title: "Image 3",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.layout !== "3col",
    }),
    defineField({
      name: "video3",
      title: "Video 3 (overrides Image 3)",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => parent?.layout !== "3col",
    }),
  ],
  preview: {
    select: { media: "image1", layout: "layout" },
    prepare({ media, layout }) {
      const labels: Record<string, string> = {
        "1col": "1 Column",
        "2col": "2 Columns",
        "2col-narrow-wide": "2 Col (1:2)",
        "2col-wide-narrow": "2 Col (2:1)",
        "3col": "3 Columns",
      };
      return { title: `Media — ${labels[layout] || layout}`, media };
    },
  },
});

// Text Block — flexible essay/article layout
const storyTextBlock = defineType({
  name: "storyTextBlock",
  title: "Text Block",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Section Heading",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike-through" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                  { name: "blank", type: "boolean", title: "Open in new tab", initialValue: false },
                ],
              },
            ],
          },
        },
        { type: "image" },
        { type: "codeBlock" },
      ],
    }),
    defineField({
      name: "theme",
      title: "Background",
      type: "string",
      options: {
        list: [
          { title: "White (Light)", value: "light" },
          { title: "Black (Dark)",  value: "dark" },
        ],
        layout: "radio",
      },
      initialValue: "light",
    }),
    defineField({
      name: "paddingTop",
      title: "Padding Top (px)",
      type: "number",
      initialValue: 160,
    }),
    defineField({
      name: "centered",
      title: "Center Text",
      type: "boolean",
      initialValue: true,
      description: "ON: centered · OFF: 12-column grid layout",
    }),
    defineField({
      name: "colWidth",
      title: "Column Width (1–12)",
      type: "number",
      initialValue: 6,
      hidden: ({ parent }) => parent?.centered === false,
    }),
    defineField({
      name: "offsetCols",
      title: "Offset Columns (0–12)",
      type: "number",
      initialValue: 0,
      hidden: ({ parent }) => parent?.centered === true,
    }),
    defineField({
      name: "headingInSeparateCol",
      title: "Heading in Separate Column",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => parent?.centered === true,
    }),
    defineField({
      name: "headingColWidth",
      title: "Heading Column Width (1–12)",
      type: "number",
      initialValue: 5,
      hidden: ({ parent }) =>
        parent?.centered === true || parent?.headingInSeparateCol !== true,
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare({ heading }) {
      return { title: heading || "Text Block" };
    },
  },
});

// Spacer Block
const storySpacerBlock = defineType({
  name: "storySpacerBlock",
  title: "Spacer",
  type: "object",
  fields: [
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Small",  value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large",  value: "large" },
        ],
        layout: "radio",
      },
      initialValue: "medium",
    }),
  ],
  preview: {
    select: { size: "size" },
    prepare({ size }) {
      return { title: `Spacer — ${size || "medium"}` };
    },
  },
});

// Hero Media Module
const storyHeroModule = defineType({
  name: "storyHeroModule",
  title: "Hero Media",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Media Type",
      type: "string",
      options: { list: ["image", "video"] },
      initialValue: "image",
    }),
    defineField({
      name: "fullBleed",
      title: "Full Bleed (no side gutter)",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "video",
      title: "Video File",
      type: "file",
      options: { accept: "video/*" },
    }),
  ],
});

// ── Story Document ─────────────────────────────────────────────────
export const story = defineType({
  name: "story",
  title: "Story / Insight",
  type: "document",
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    // ── Categories (multi-select from Story Category documents)
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "storyCategory" }] }],
      description: "Select one or more Story Categories",
    }),
    // ── Tags (free-form keywords)
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: 'Free-form keywords, e.g. ["React", "Animation", "Tooling"]',
    }),
    // ── External Links (Single page buttons)
    defineField({
      name: "githubUrl",
      title: "GitHub URL",
      type: "url",
      description: "Shown as 'GitHub' button on the Story single page",
    }),
    defineField({
      name: "stackblitzUrl",
      title: "StackBlitz URL",
      type: "url",
      description: "Shown as 'StackBlitz' button on the Story single page",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      description: "Short one-liner shown under the title on the single page.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary for the list page card and SEO.",
    }),

    // ── Thumbnails ──
    // `thumbnail` retained for backward compatibility with existing data.
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image (Legacy / Fallback)",
      type: "image",
      options: { hotspot: true },
      description: "기존 단일 썸네일. 신규 작성 시 Landscape를 사용하세요.",
    }),
    defineField({
      name: "thumbnailLandscape",
      title: "Thumbnail — Landscape (★ 신규 권장)",
      type: "image",
      options: { hotspot: true },
      description: "권장 3584×2016 (16:9). Stories List Landscape + 폴백 기준.",
    }),
    defineField({
      name: "thumbnailPortrait",
      title: "Thumbnail — Portrait (선택)",
      type: "image",
      options: { hotspot: true },
      description: "권장 1762×1309. 홈/리스트 50% 세로형. 미등록 시 Landscape에서 자동 폴백.",
    }),

    defineField({
      name: "listDescription",
      title: "List Description",
      type: "string",
      description: "리스트 페이지 썸네일 아래 노출 (선택)",
    }),

    // ── Hero Media ──
    defineField({
      name: "heroMedia",
      title: "Hero Media (After Title)",
      type: "storyHeroModule",
      description: "타이틀 이후, 콘텐츠 모듈 이전에 표시되는 이미지/영상",
    }),

    // ── Content Modules ──
    defineField({
      name: "modules",
      title: "Content Modules",
      type: "array",
      of: [
        // New (recommended)
        { type: "storyMediaBlock" },
        { type: "storyTextBlock" },
        { type: "storySpacerBlock" },
        // Legacy (kept for backward compat with existing documents)
        { type: "storyMediaModule" },
        { type: "storyTwoColImageModule" },
        { type: "storyTextModule" },
      ],
      description: "신규: Media Block / Text Block / Spacer · 기존 데이터: Legacy 모듈 자동 인식",
    }),

    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 99,
      description: "낮을수록 먼저. 비워두면 publishedAt 기준.",
    }),
  ],

  preview: {
    select: {
      title: "title",
      category0: "categories.0.title",
      mediaLand: "thumbnailLandscape",
      mediaLegacy: "thumbnail",
    },
    prepare({ title, category0, mediaLand, mediaLegacy }) {
      return {
        title: title || "Untitled Story",
        subtitle: category0 || "",
        media: mediaLand || mediaLegacy,
      };
    },
  },
});

// ── Legacy Module Types (backward compat for existing documents) ──────
// 기존 문서가 가진 storyMediaModule / storyTwoColImageModule / storyTextModule
// 데이터를 그대로 보존하기 위한 호환 타입. 신규 작성에는 사용하지 않음.

const storyMediaModule = defineType({
  name: "storyMediaModule",
  title: "Media (Legacy)",
  type: "object",
  fields: [
    defineField({ name: "mediaType", title: "Media Type", type: "string", options: { list: ["image", "video"] }, initialValue: "image" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "video", title: "Video", type: "file", options: { accept: "video/*" } }),
    defineField({ name: "narrow", title: "Narrow", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { image: "image", mediaType: "mediaType" },
    prepare({ image, mediaType }) {
      return { title: `Legacy Media (${mediaType || "image"})`, media: image };
    },
  },
});

const storyTwoColImageModule = defineType({
  name: "storyTwoColImageModule",
  title: "2-Col Images (Legacy)",
  type: "object",
  fields: [
    defineField({ name: "leftImage", title: "Left Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "rightImage", title: "Right Image", type: "image", options: { hotspot: true } }),
  ],
  preview: {
    select: { left: "leftImage" },
    prepare({ left }) {
      return { title: "Legacy 2-Col Images", media: left };
    },
  },
});

const storyTextModule = defineType({
  name: "storyTextModule",
  title: "Text Block (Legacy)",
  type: "object",
  fields: [
    defineField({ name: "paddingTop", title: "Padding Top", type: "number", initialValue: 160 }),
    defineField({ name: "centered", title: "Center Content", type: "boolean", initialValue: true }),
    defineField({ name: "offsetCols", title: "Offset Cols", type: "number", initialValue: 0 }),
    defineField({ name: "colWidth", title: "Col Width", type: "number", initialValue: 6 }),
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "headingInSeparateCol", title: "Heading in Separate Col", type: "boolean", initialValue: false }),
    defineField({ name: "headingColWidth", title: "Heading Col Width", type: "number", initialValue: 5 }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{
        type: "block",
        marks: {
          decorators: [
            { title: "Strong", value: "strong" },
            { title: "Emphasis", value: "em" },
            { title: "Underline", value: "underline" },
            { title: "Strike", value: "strike-through" },
            { title: "Code", value: "code" },
          ],
          annotations: [{
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              { name: "href", type: "url", title: "URL" },
              { name: "blank", type: "boolean", title: "Open in new tab", initialValue: false },
            ],
          }],
        },
      },
      { type: "codeBlock" }],
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare({ heading }) {
      return { title: heading ? `Legacy Text — ${heading}` : "Legacy Text Block" };
    },
  },
});

// ── Code Block (inside Portable Text) ────────────────────────────
// Multi-line syntax-highlightable code snippet. Added to the `body`
// arrays of storyTextBlock and legacy storyTextModule.
const codeBlock = defineType({
  name: "codeBlock",
  title: "Code Block",
  type: "object",
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "Plain text", value: "text" },
          { title: "TypeScript", value: "ts" },
          { title: "JavaScript", value: "js" },
          { title: "TSX", value: "tsx" },
          { title: "JSX", value: "jsx" },
          { title: "HTML", value: "html" },
          { title: "CSS", value: "css" },
          { title: "SCSS", value: "scss" },
          { title: "JSON", value: "json" },
          { title: "Bash", value: "bash" },
          { title: "Markdown", value: "md" },
          { title: "GROQ", value: "groq" },
        ],
        layout: "dropdown",
      },
      initialValue: "ts",
    }),
    defineField({
      name: "filename",
      title: "Filename (optional)",
      type: "string",
      description: 'Shown above the code block, e.g. "src/utils/wave.ts"',
    }),
    defineField({
      name: "code",
      title: "Code",
      type: "text",
      rows: 10,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { language: "language", filename: "filename", code: "code" },
    prepare({ language, filename, code }) {
      const firstLine = (code ?? "").split("\n")[0].slice(0, 60);
      return {
        title: filename || `<code> ${language ?? "text"}`,
        subtitle: firstLine,
      };
    },
  },
});

export {
  storyMediaBlock,
  storyTextBlock,
  storySpacerBlock,
  storyHeroModule,
  codeBlock,
  // legacy
  storyMediaModule,
  storyTwoColImageModule,
  storyTextModule,
};
