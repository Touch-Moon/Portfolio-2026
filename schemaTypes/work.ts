import { defineType, defineField } from "sanity";

// ── Module object types ───────────────────────────────────────────

// Media Block — 이미지/영상 통합 모듈
// 1/2/3 컬럼, 비대칭 비율, guttered/full-bleed, 간격 조절
const mediaBlock = defineType({
  name: "mediaBlock",
  title: "Media Block",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "1 Column (2688px)",           value: "1col" },
          { title: "2 Columns — Equal (1340px each)",     value: "2col" },
          { title: "2 Columns — Narrow:Wide (900 / 1800px)", value: "2col-narrow-wide" },
          { title: "2 Columns — Wide:Narrow (1800 / 900px)", value: "2col-wide-narrow" },
          { title: "3 Columns (900px each)",       value: "3col" },
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
          { title: "Tight", value: "tight" },
          { title: "None", value: "none" },
          { title: "No Gap", value: "no-gap" },
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
    // ── Slot 1 ──────────────────────────────────────────────────────
    defineField({
      name: "image1",
      title: "Image 1",
      type: "image",
      options: { hotspot: true },
      description: "이미지 또는 영상 중 하나만 등록 | 1col guttered: 2688px · full-bleed: 2560px · 2col equal: 1340px · 2col 1:2 narrow: 900px · 2col 2:1 wide: 1800px",
    }),
    defineField({
      name: "video1",
      title: "Video 1 (overrides Image 1)",
      type: "file",
      options: { accept: "video/*" },
      description: "등록 시 Image 1 대신 영상 표시 | 권장 1920×1080 (FHD) · 8~15MB 이하",
    }),
    defineField({
      name: "skin1",
      title: "Slot 1 — Device Skin",
      type: "string",
      options: {
        list: [
          { title: "None (기본)",  value: "none" },
          { title: "Desktop",      value: "desktop" },
          { title: "Tablet (iPad)", value: "tablet" },
          { title: "Mobile (iPhone)", value: "mobile" },
        ],
        layout: "radio",
      },
      initialValue: "none",
      description: "영상/이미지를 디바이스 프레임 안에 표시",
    }),
    defineField({
      name: "skinBg1",
      title: "Slot 1 — Background",
      type: "string",
      options: {
        list: [
          { title: "Transparent", value: "transparent" },
          { title: "Dark  (#2E2F32)", value: "dark" },
          { title: "Light (#E8E9ED)", value: "light" },
          { title: "White (#FFFFFF)", value: "white" },
          { title: "Image", value: "image" },
        ],
        layout: "radio",
      },
      initialValue: "transparent",
      hidden: ({ parent }) => !parent?.skin1 || parent.skin1 === "none",
    }),
    defineField({
      name: "skinBgImage1",
      title: "Slot 1 — Background Image",
      type: "image",
      options: { hotspot: true },
      description: "디바이스 프레임 배경 이미지 (영상 뒤에 표시)",
      hidden: ({ parent }) => parent?.skinBg1 !== "image",
    }),
    // ── Slot 2 ──────────────────────────────────────────────────────
    defineField({
      name: "image2",
      title: "Image 2",
      type: "image",
      options: { hotspot: true },
      description: "이미지 또는 영상 중 하나만 등록 | 2col equal: 1340px · 2col narrow:wide → wide: 1800px · 2col wide:narrow → narrow: 900px · 3col: 900px",
      hidden: ({ parent }) => !parent?.layout || parent.layout === "1col",
    }),
    defineField({
      name: "video2",
      title: "Video 2 (overrides Image 2)",
      type: "file",
      options: { accept: "video/*" },
      description: "등록 시 Image 2 대신 영상 표시 | 권장 1920×1080 (FHD) · 8~15MB 이하",
      hidden: ({ parent }) => !parent?.layout || parent.layout === "1col",
    }),
    defineField({
      name: "skin2",
      title: "Slot 2 — Device Skin",
      type: "string",
      options: {
        list: [
          { title: "None (기본)",    value: "none" },
          { title: "Desktop",        value: "desktop" },
          { title: "Tablet (iPad)",  value: "tablet" },
          { title: "Mobile (iPhone)", value: "mobile" },
        ],
        layout: "radio",
      },
      initialValue: "none",
      description: "영상/이미지를 디바이스 프레임 안에 표시",
      hidden: ({ parent }) => !parent?.layout || parent.layout === "1col",
    }),
    defineField({
      name: "skinBg2",
      title: "Slot 2 — Background",
      type: "string",
      options: {
        list: [
          { title: "Transparent", value: "transparent" },
          { title: "Dark  (#2E2F32)", value: "dark" },
          { title: "Light (#E8E9ED)", value: "light" },
          { title: "White (#FFFFFF)", value: "white" },
          { title: "Image", value: "image" },
        ],
        layout: "radio",
      },
      initialValue: "transparent",
      hidden: ({ parent }) => !parent?.skin2 || parent.skin2 === "none" || parent.layout === "1col",
    }),
    defineField({
      name: "skinBgImage2",
      title: "Slot 2 — Background Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.skinBg2 !== "image",
    }),
    // ── Slot 3 ──────────────────────────────────────────────────────
    defineField({
      name: "image3",
      title: "Image 3",
      type: "image",
      options: { hotspot: true },
      description: "이미지 또는 영상 중 하나만 등록 | 3col: 900px",
      hidden: ({ parent }) => parent?.layout !== "3col",
    }),
    defineField({
      name: "video3",
      title: "Video 3 (overrides Image 3)",
      type: "file",
      options: { accept: "video/*" },
      description: "등록 시 Image 3 대신 영상 표시 | 권장 1920×1080 (FHD) · 8~15MB 이하",
      hidden: ({ parent }) => parent?.layout !== "3col",
    }),
    defineField({
      name: "skin3",
      title: "Slot 3 — Device Skin",
      type: "string",
      options: {
        list: [
          { title: "None (기본)",    value: "none" },
          { title: "Desktop",        value: "desktop" },
          { title: "Tablet (iPad)",  value: "tablet" },
          { title: "Mobile (iPhone)", value: "mobile" },
        ],
        layout: "radio",
      },
      initialValue: "none",
      description: "영상/이미지를 디바이스 프레임 안에 표시",
      hidden: ({ parent }) => parent?.layout !== "3col",
    }),
    defineField({
      name: "skinBg3",
      title: "Slot 3 — Background",
      type: "string",
      options: {
        list: [
          { title: "Transparent", value: "transparent" },
          { title: "Dark  (#2E2F32)", value: "dark" },
          { title: "Light (#E8E9ED)", value: "light" },
          { title: "White (#FFFFFF)", value: "white" },
          { title: "Image", value: "image" },
        ],
        layout: "radio",
      },
      initialValue: "transparent",
      hidden: ({ parent }) => !parent?.skin3 || parent.skin3 === "none" || parent.layout !== "3col",
    }),
    defineField({
      name: "skinBgImage3",
      title: "Slot 3 — Background Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.skinBg3 !== "image",
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

// Text Block — 텍스트 모듈 (offset, center, paddingTop, layout 추가)
const textBlock = defineType({
  name: "textBlock",
  title: "Text Block",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Default (heading above body)", value: "default" },
          { title: "Split (body left, heading right)", value: "split" },
        ],
        layout: "radio",
      },
      initialValue: "default",
      description: "Split: 좌측 본문 + 우측 대형 헤딩 (plastic.design 스타일)",
    }),
    defineField({ name: "heading", title: "Section Heading", type: "string" }),
    defineField({ name: "body", title: "Body Text", type: "text", rows: 5 }),
    defineField({
      name: "columnWidth",
      title: "Column Width (1–12)",
      type: "number",
      options: { list: [5, 6, 7, 8] },
      initialValue: 7,
      hidden: ({ parent }) => parent?.layout === "split",
    }),
    defineField({
      name: "offsetCols",
      title: "Left Offset Columns",
      type: "number",
      options: { list: [0, 1, 2, 3] },
      initialValue: 0,
      description: "왼쪽에서 몇 컬럼 떨어지게 할지",
      hidden: ({ parent }) => parent?.layout === "split",
    }),
    defineField({
      name: "centered",
      title: "Center Align",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => parent?.layout === "split",
    }),
    defineField({
      name: "theme",
      title: "Background",
      type: "string",
      options: {
        list: [
          { title: "White (Light)", value: "light" },
          { title: "Black (Dark)", value: "dark" },
        ],
        layout: "radio",
      },
      initialValue: "light",
      description: "배경색 선택. Dark 선택 시 텍스트가 자동으로 화이트로 전환",
    }),
    defineField({
      name: "paddingTop",
      title: "Top Padding",
      type: "string",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Large", value: "large" },
          { title: "None", value: "none" },
        ],
      },
      initialValue: "default",
    }),
  ],
  preview: {
    select: { heading: "heading", body: "body" },
    prepare({ heading, body }) {
      return { title: heading || "Text Block", subtitle: body?.slice(0, 60) };
    },
  },
});

// Spacer — 모듈 사이 여백 조절
const spacerBlock = defineType({
  name: "spacerBlock",
  title: "Spacer",
  type: "object",
  fields: [
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
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

// ── Work document type ────────────────────────────────────────────

export const work = defineType({
  name: "work",
  title: "Work",
  type: "document",
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  fields: [
    // ── Basic Info
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Hyundai annual convention."',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: 'e.g. "2025"',
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      description: "Short one-line description shown below the title",
    }),
    defineField({
      name: "overview",
      title: "Overview",
      type: "text",
      rows: 6,
      description: "Full project overview text",
    }),

    // ── Thumbnails ─────────────────────────────────────────────────────────────
    defineField({
      name: "thumbnailLandscape",
      title: "Thumbnail image — Landscape ★ 필수",
      type: "image",
      options: { hotspot: true },
      description: "★ 필수. 권장 3584×2016 (16:9). Work 페이지 100% Landscape Thumbnail + Portrait 미등록 시 자동 센터 크롭 폴백 소스.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnailPortrait",
      title: "Thumbnail image — Portrait (선택)",
      type: "image",
      options: { hotspot: true },
      description: "선택. 권장 1762×1309. 홈 SELECTED WORKS + Work 페이지 50% 세로형. 미등록 시 Landscape 이미지에서 자동 센터 크롭.",
    }),

    // ── List Page Fields
    defineField({
      name: "listDescription",
      title: "List Description",
      type: "string",
      description: 'Shown under thumbnail on list page. e.g. "Hyundai annual convention. Designing the visual concept..."',
    }),

    // ── Selected Works Carousel Fields
    defineField({
      name: "cardSize",
      title: "Card Size (Selected Works)",
      type: "string",
      options: {
        list: [
          { title: "Large  (1.27 : 1)", value: "large" },
          { title: "Wide   (1.5  : 1)", value: "wide" },
          { title: "Compact (1 : 1)",   value: "compact" },
          { title: "Tall   (0.8 : 1)",  value: "tall" },
        ],
        layout: "radio",
      },
      initialValue: "large",
      description: "Selected Works 캐러셀에서 카드의 가로 비율 결정",
    }),

    // ── Categories (multi-select from Work Category documents)
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "workCategory" }] }],
      description: "Select one or more Work Categories",
    }),

    // ── Tags (free-form keywords)
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: 'Free-form keywords, e.g. ["Next.js", "Sanity", "Framer Motion"]',
    }),

    // ── Services (What We Do)
    defineField({
      name: "services",
      title: "Services (What We Do)",
      type: "array",
      of: [{ type: "string" }],
      description: 'e.g. ["Strategic Design", "Research", "Branding"]',
    }),

    // ── External Links (Single page buttons)
    defineField({
      name: "siteUrl",
      title: "Live Site URL",
      type: "url",
      description: "Shown as 'Visit Site' button on the Work single page",
    }),
    defineField({
      name: "githubUrl",
      title: "GitHub Repo URL",
      type: "url",
      description: "Shown as 'GitHub' button on the Work single page",
    }),

    // ── Hero Media
    defineField({
      name: "heroMedia",
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
        defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true }, description: "권장 2880px wide (1440 @2x) · 비율 자유" }),
        defineField({ name: "video", title: "Video File", type: "file", options: { accept: "video/*" }, description: "권장 1920×1080 (FHD) · 8~15MB 이하" }),
      ],
    }),

    // ── Content Modules (리팩토링: 3 모듈 체계)
    defineField({
      name: "modules",
      title: "Content Modules",
      type: "array",
      of: [
        { type: "mediaBlock" },
        { type: "textBlock" },
        { type: "spacerBlock" },
      ],
    }),

    // ── Display Order
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls order in the list grid. Lower = first.",
      initialValue: 99,
    }),
  ],

  preview: {
    select: { title: "title", media: "thumbnailLandscape" },
    prepare({ title, media }) {
      return { title: title || "Untitled Work", media };
    },
  },
});

// Export module types so they can be registered
export { mediaBlock, textBlock, spacerBlock };
