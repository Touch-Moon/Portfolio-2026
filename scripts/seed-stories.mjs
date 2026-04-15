#!/usr/bin/env node
/**
 * Sanity Stories Seed Script
 * --------------------------
 * Uploads images/videos from plastic.design and creates 4 story documents.
 *
 * Usage:
 *   node scripts/seed-stories.mjs            # upload media + create stories
 *   node scripts/seed-stories.mjs --no-media  # text only, skip media uploads
 *   node scripts/seed-stories.mjs --no-video  # skip video uploads (images only)
 */

// ── SSL bypass for plastic.design self-signed cert ───────────────
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { createClient } from '@sanity/client';
import crypto from 'crypto';

const SKIP_MEDIA = process.argv.includes('--no-media');
const SKIP_VIDEO = process.argv.includes('--no-video') || SKIP_MEDIA;
const SKIP_IMAGE = SKIP_MEDIA;

const client = createClient({
  projectId: '9z8k2qza',
  dataset: 'production',
  token: 'skgsLGGZbz9uPlEW3nl9mCuCdvNGQX4LLzIyWeICVjj7k5TdzM8ZaskAMxvrpixLyfl6OTSBwyxYITYNCkWWm5E41fBoT5dptHKEHCF11by7tDIsFYAfzGVEnEJBPFfYYa5PK3GQ2lGtCt9A8yAFii3j8QBuTIFknfXwPsbmaYZymmH64wwo',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ── Helpers ───────────────────────────────────────────────────────
function key() {
  return crypto.randomBytes(6).toString('hex');
}

/** Convert paragraph strings to Sanity Portable Text blocks */
function blocks(...texts) {
  return texts.filter(Boolean).map(text => ({
    _type: 'block',
    _key: key(),
    style: 'normal',
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }));
}

/** Upload an image from URL to Sanity, returns Sanity image reference object */
async function uploadImage(url) {
  if (SKIP_IMAGE) return null;
  const filename = url.split('/').pop();
  process.stdout.write(`    ↑ Image: ${filename} ... `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload('image', buf, { filename });
    console.log(`✓ (${asset._id})`);
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  } catch (err) {
    console.log(`✗ ${err.message}`);
    return null;
  }
}

/** Upload a video file from URL to Sanity, returns Sanity file reference object */
async function uploadVideo(url) {
  if (SKIP_VIDEO) return null;
  const filename = url.split('/').pop();
  process.stdout.write(`    ↑ Video: ${filename} ... `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload('file', buf, { filename });
    console.log(`✓ (${asset._id})`);
    return { _type: 'file', asset: { _type: 'reference', _ref: asset._id } };
  } catch (err) {
    console.log(`✗ ${err.message}`);
    return null;
  }
}

// ── Story definitions ─────────────────────────────────────────────
// Each story uses a builder pattern:
//   media(type, url)
//   text({ paddingTop, centered, colWidth, offsetCols, heading, headingInSeparateCol, headingColWidth, paragraphs[] })
//   img2col(leftUrl, rightUrl)

const BASE = 'https://plastic.design/uploads';

const STORIES = [

  // ────────────────────────────────────────────────────────────────
  // 1. INDUSTRIAL
  // ────────────────────────────────────────────────────────────────
  {
    title: 'The Digital challenge of the industrial sector.',
    slug: 'the-digital-challenge-of-the-industrial-sector',
    category: 'Insights',
    publishedAt: '2025-01-15T00:00:00Z',
    excerpt: 'A deep dive into how digitalization and strategic design are reshaping the industrial sector, based on research across leading companies.',
    thumbnailUrl: `${BASE}/digital-trends-2025/digital-trends-2025-header.webp`,
    order: 1,
    modules: [
      {
        _mod: 'media', mediaType: 'video',
        url: `${BASE}/digital-trends-2025/digital-trends-2025-header.mp4`,
      },
      {
        _mod: 'text',
        paddingTop: 0,
        centered: false,
        offsetCols: 0,
        colWidth: 5,
        heading: 'The industrial sector in the face of a constantly transforming landscape.',
        headingInSeparateCol: true,
        headingColWidth: 4,
        paragraphs: [
          'The industrial sector is undergoing an unprecedented transformation driven by digitalization, technological innovation, and a growing need to adapt to a constantly evolving environment. The convergence of strategic design, digital experience, and the implementation of new technologies is not just a trend but a necessity to remain competitive. However, in this complex and dynamic landscape, companies face significant challenges: a lack of clarity about key trends, the need for well-informed decisions, and adapting to a market that demands agility and long-term vision.',
          'In this context, having clear and validated information becomes an essential tool for making strategic decisions with confidence and anticipating future challenges.',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 320,
        centered: false,
        colWidth: 5,
        paragraphs: [
          'At Plastic Design, we have been collaborating with leading companies in the industrial sector for over a decade, helping them tackle their digital and strategic challenges. This experience has allowed us to gain an in-depth understanding of their dynamics, specific needs, and the opportunities that arise in a constantly evolving environment.',
        ],
      },
      {
        _mod: 'media', mediaType: 'video',
        url: `${BASE}/services/industrial/plastic-services-industrial-header.mp4`,
      },
      {
        _mod: 'text',
        paddingTop: 0,
        centered: false,
        offsetCols: 0,
        colWidth: 5,
        heading: 'Reflections and key insights to understand the current state of the sector.',
        headingInSeparateCol: true,
        headingColWidth: 3,
        paragraphs: [
          'In this research, we aimed to capture a broad and clear vision of the industrial sector, analyzing its strengths, needs, and most significant challenges. Using a mixed research methodology that combines surveys, in-depth interviews, and comparative analyses, we have been able to provide a well-rounded perspective that delivers practical and actionable insights for the sector.',
          'The report offers relevant insights, key trends, and opportunities for improvement, providing a clear and realistic framework. It is not intended to serve as a definitive guide but as a tool to inspire reflection and support strategic decision-making.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // 2. HEALTHCARE
  // ────────────────────────────────────────────────────────────────
  {
    title: 'Tech innovation for effective healthcare.',
    slug: 'tech-innovation-effective-healthcare',
    category: 'Technology',
    publishedAt: '2025-03-10T00:00:00Z',
    excerpt: 'How digital innovation is revolutionising healthcare delivery — with case studies from Synlab, Siemens Healthineers, and Labor Team.',
    thumbnailUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-for-effective-healthcare-header.webp`,
    order: 2,
    modules: [
      {
        _mod: 'media', mediaType: 'video',
        url: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-header.mp4`,
      },
      {
        _mod: 'text',
        paddingTop: 160,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'The healthcare field has undergone an unprecedented transformation in recent years, ushering in an era where technological innovation and digital solutions have become fundamental pillars. This radical shift has not only revolutionised how healthcare is delivered but has also redefined the relationship between healthcare professionals and patients.',
          'The constant evolution of the healthcare sector has been propelled by a series of interconnected factors: from cutting-edge technological advancements to the growing need to enhance operational efficiency and the quality of care. The adoption of new technologies such as artificial intelligence, the Internet of Things (IoT), telemedicine, and data analytics has allowed for a significant improvement in the diagnosis, treatment, and monitoring of diseases.',
          'In this article, we want to share our journey and expertise in implementing innovative projects in the healthcare sector. We will explore specific examples of solutions implemented for prominent clients like Siemens Healthineers, Synlab, and Labor Team, highlighting how these initiatives have transformed the way our clients address various challenges in the healthcare realm.',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 0,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'Success Story #1',
          'The Challenge: Synlab, a leading laboratory recognised for its innovation in the biomedical field and pioneers in PCR testing in Europe, aimed to enhance accessibility and efficiency in delivering biomedical results to Synlab\'s patients. The challenge lay in the difficulty of obtaining these data, limiting the optimization of their potential, thereby affecting medical decision-making and response agility.',
          'How we solved it: We developed MySynlab, a secure and agile digital platform. We implemented advanced technologies to interpret complex data, transforming raw data into accessible and meaningful information for patients. An innovative design and an intuitive user experience were implemented to ensure that the platform was not only functional but also user-friendly, improving the quality of healthcare at all touchpoints.',
        ],
      },
      {
        _mod: 'img2col',
        leftUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-02.webp`,
        rightUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-03.webp`,
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'Success Story #2',
          'The Challenge: Siemens Healthineers challenged us to create an innovative platform tailored for healthcare professionals. The goal was to provide high-quality content crafted by experts in the health industry, aiming to build a robust community in this sector. Simultaneously, they sought to gather precise and detailed user data to enhance the customer experience and boost the performance of their data model.',
          'How we tackled it: We crafted an exclusive platform that enabled healthcare professionals to access events through digital passes and consume content tailored to their interests. Additionally, we designed an internal content management platform, streamlining the agile generation of event pages and the creation of quality content backed by AI. To further feed and enrich Siemens Healthineers\' data model, we integrated a Single Sign-On (SSO) system, activating users and segmenting them according to their professional profiles.',
        ],
      },
      {
        _mod: 'img2col',
        leftUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-05.webp`,
        rightUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-06.webp`,
      },
      {
        _mod: 'img2col',
        leftUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-07.webp`,
        rightUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-08.webp`,
      },
      {
        _mod: 'img2col',
        leftUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-09.webp`,
        rightUrl: `${BASE}/tech-innovation-effective-healthcare/tech-innovation-effective-healthcare-10.webp`,
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // 3. BRANDING
  // ────────────────────────────────────────────────────────────────
  {
    title: 'The Digital symphony of branding.',
    slug: 'digital-symphony-branding-evolution',
    category: 'Branding',
    publishedAt: '2024-11-20T00:00:00Z',
    excerpt: 'Why branding in the digital age is more than aesthetics — it\'s a complete, evolving experience that orchestrates every interaction.',
    thumbnailUrl: `${BASE}/the-digital-symphony-of-branding/the-digital-symphony-of-branding-header.webp`,
    order: 3,
    modules: [
      {
        _mod: 'media', mediaType: 'video',
        url: `${BASE}/the-digital-symphony-of-branding/the-digital-symphony-of-branding-header.mp4`,
      },
      {
        _mod: 'text',
        paddingTop: 160,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'Successful brands are master orchestras using every element at their disposal to create a harmony that reaches deep into their customers\' hearts. In this sense, branding is no longer just about appearance, a static storefront, but a profound narrative, a symphony that evolves and unfolds with each interaction. Branding is far more than a sum of elements, accurate or not; it is an entirety that seduces and lives with its users over time.',
          'This is not new. The concept of branding has undergone a deep transformation for some time now. It moved beyond the simplistic notion of a logo, colors, and typography. It embraced a much deeper, richer understanding. Innovative companies like Apple and Nike played a pivotal role in this evolution because they realized that branding must be an experience that is forged and matures over time. Our relationship with a brand or product is not alien to our social nature. Just as in any interaction, the way we see and connect with a brand is formed through judgments, values rooted in our personal history, and feelings that arise as we explore what the brand offers.',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 160,
        centered: true,
        colWidth: 8,
        paragraphs: [
          '"Digital products actually represent a vast universe of interaction between the brand and the customer."',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 160,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'In the context of digital products, these arguments become significantly intensified. Often, digital products are considered just another piece of the brand puzzle, but in reality, they represent a vast universe of interaction between the brand and the customer. We are entering a space where every detail, every interaction, and every design decision takes on crucial importance, where branding becomes the thread that ties all these elements into a coherent and immersive narrative.',
        ],
      },
      {
        _mod: 'media', mediaType: 'image',
        url: `${BASE}/the-digital-symphony-of-branding/the-digital-symphony-of-branding-01.webp`,
        narrow: true,
      },
      {
        _mod: 'text',
        paddingTop: 160,
        centered: true,
        colWidth: 6,
        paragraphs: [
          '"Real excellence is orchestrating a complete experience from the first to the last interaction."',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 160,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'Every graphic detail, every interaction, and every nuance in tone of voice add up to forge a narrative that transcends mere functionality, usability, or specific transactions. It\'s about those small flashes of personalization that make each user feel unique, the uniqueness and relevance of content, or the way we communicate with the user. How we guide them, attend to them, help them. It\'s also about more technical aspects like the speed at which the system responds or the trust that the product can inspire. These are just some of the many elements that compose a complex symphony. Experience teaches us that excellence in product design goes beyond technical and aesthetic perfection. While attention to detail, composition, and mastery of typography are important, they are not the sole focus. True excellence lies in the ability to orchestrate a complete experience from the first interaction to the last.',
          'In any project we undertake, we aim to incorporate the brand\'s presence at the core of the project, equally as important as the user and business objectives. We begin with close collaboration with the client to deeply understand the essence of the brand, its strategy, and its context within the industry. This phase encompasses not only brand introspection but also analyzing the market and competition and identifying opportunities and challenges. Once we have gained a deep understanding of the brand and its strategic vision, we work on creating guides and guidelines that act as roadmaps for the project. These guides ensure that we never lose sight of the brand\'s identity or purpose at any point in the design and development process.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  // 4. REFLECTIONS
  // ────────────────────────────────────────────────────────────────
  {
    title: 'Reflections on design in the current context.',
    slug: 'reflections-on-design-current-context',
    category: 'Insights',
    publishedAt: '2024-09-05T00:00:00Z',
    excerpt: 'After a decade of digital design, we reflect on a growing tension between data-driven processes and the human creativity that makes truly memorable products.',
    thumbnailUrl: `${BASE}/design-conformity/design-conformity-header.webp`,
    order: 4,
    modules: [
      {
        _mod: 'media', mediaType: 'image',
        url: `${BASE}/design-conformity/design-conformity-header.webp`,
      },
      {
        _mod: 'text',
        paddingTop: 160,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'At Plastic, we have been designing high-level digital solutions and brands since 2012. We have witnessed firsthand the evolution of our sector, the changes in trends and needs, the emergence of new profiles, tools, and methodologies... an exciting evolution that helps us better understand our environment, optimize processes, and improve the results of our work.',
          'Over the past year, through interactions with clients from various sectors and sizes, and more than 30 team leaders in areas such as Marketing, Product, Business, and Design, we have observed a growing need and a recurring concern that has caught our attention.',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: false,
        colWidth: 8,
        paragraphs: [
          '"We need more creative proposals."',
          'Marketing Director of an international company',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'Almost unanimously, clients highlight the lack of personalized, differentiated proposals, and in many cases, the lack of creative solutions.',
          'This has been the starting point for a deep reflection on the current state of design and how we, as specialists, can bring our strategic vision to continue helping various entities through design.',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: false,
        colWidth: 10,
        paragraphs: [
          '"We have focused a lot on methodologies and UX, but we need to start thinking more about the visual aspect. We have neglected it, and it is affecting us."',
          'Marketing Director of an international company',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'In recent years, technology has played a crucial role in making our processes more efficient. We have continuously tested, iterated, and improved our designs to optimize their effectiveness. And now AI is not only making us more efficient, but it can also even replace creativity with the click of a button. Fascinating.',
          'It\'s great, if something works, I can use it in all future projects. After collecting a multitude of data, reviewing the precise recommendations given by industry experts, using Google\'s Material Design, the same style of icons, graphics, illustrations... one can follow an online recipe. A "right way" to do things.',
          'If we all use the same methodologies, the same tools, have the same data, we will therefore reach the same conclusions and generate homogeneous systems.',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: false,
        colWidth: 10,
        paragraphs: [
          '"We want to see something that speaks about us, something that sets us apart."',
          'Marketing Director of an international company',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'What is the difference between the products we consume today? What unique and singular value does the interaction with a product or service convey to the consumer?',
          'The quest to cater to the masses often generates homogenized production, where originality and uniqueness are sacrificed in favor of certain short-term data, but does it really satisfy our users? Are we really listening to them? Are we neglecting the emotional connection that users seek?',
          'Perhaps this trajectory towards numbers, data, methods, and technology above all else is hindering our connection with people, the pursuit of excellence, and stifling our creative capacity.',
          'Marketers have known for a long time that purchasing decisions are based much more on unconscious motives than on logical reasoning. They also know that emotion is the most solid, profound, and lasting way we have to reach the hearts of our customers and users.',
          'We know that brands that evoke strong emotions have a much more effective and strategic impact than those that simply focus on optimizing functionalities.',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: false,
        colWidth: 10,
        paragraphs: [
          '"We have acceptable products, but there is a lot of room for improvement."',
          'Marketing Director of an international company',
        ],
      },
      {
        _mod: 'text',
        paddingTop: 224,
        centered: true,
        colWidth: 6,
        paragraphs: [
          'Have we disconnected from people and their emotions? Ultimately, from our users. Have we disconnected from the most qualitative and emotional part of what we do?',
          'Yes to data. Yes to methodologies. Yes to everything we have learned over the years, and to everything we have available to make better products.',
          'But without forgetting that design is essentially a creative process, a form of human connection. We advocate for balancing the technical-scientific and emotional aspects of design to reach its full potential. We believe that balance can help us move from creating correct products to creating products with soul, personalized, with a strong human connection, that remain in memory and fulfill a growing need among clients and users.',
        ],
      },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding stories into Sanity...\n');
  console.log(`   Flags: media=${!SKIP_MEDIA}, video=${!SKIP_VIDEO}, images=${!SKIP_IMAGE}\n`);

  for (const storyDef of STORIES) {
    console.log(`\n📖 "${storyDef.title}"`);

    // Check if story already exists
    const existing = await client.fetch(
      `*[_type == "story" && slug.current == $slug][0]._id`,
      { slug: storyDef.slug }
    );
    if (existing) {
      console.log(`   ⚠️  Already exists (${existing}) — skipping.`);
      continue;
    }

    // Upload thumbnail
    let thumbnail = null;
    if (storyDef.thumbnailUrl) {
      process.stdout.write(`  Thumbnail ... `);
      try {
        const res = await fetch(storyDef.thumbnailUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        const asset = await client.assets.upload('image', buf, {
          filename: storyDef.thumbnailUrl.split('/').pop(),
        });
        thumbnail = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
        console.log(`✓`);
      } catch (err) {
        console.log(`✗ ${err.message}`);
      }
    }

    // Process modules
    const modules = [];
    for (const mod of storyDef.modules) {

      if (mod._mod === 'media') {
        const m = { _type: 'storyMediaModule', _key: key(), mediaType: mod.mediaType, narrow: mod.narrow || false };
        if (mod.mediaType === 'video') {
          const asset = await uploadVideo(mod.url);
          if (asset) m.video = asset;
        } else {
          const asset = await uploadImage(mod.url);
          if (asset) m.image = asset;
        }
        modules.push(m);

      } else if (mod._mod === 'img2col') {
        const left  = await uploadImage(mod.leftUrl);
        const right = await uploadImage(mod.rightUrl);
        modules.push({ _type: 'storyTwoColImageModule', _key: key(), leftImage: left, rightImage: right });

      } else if (mod._mod === 'text') {
        modules.push({
          _type: 'storyTextModule',
          _key: key(),
          paddingTop: mod.paddingTop ?? 160,
          centered: mod.centered !== false,
          colWidth: mod.colWidth ?? 6,
          offsetCols: mod.offsetCols ?? 0,
          ...(mod.heading && { heading: mod.heading }),
          headingInSeparateCol: mod.headingInSeparateCol ?? false,
          ...(mod.headingColWidth && { headingColWidth: mod.headingColWidth }),
          body: blocks(...(mod.paragraphs || [])),
        });
      }
    }

    // Create the story document
    const doc = {
      _type: 'story',
      title: storyDef.title,
      slug: { _type: 'slug', current: storyDef.slug },
      category: storyDef.category,
      publishedAt: storyDef.publishedAt,
      excerpt: storyDef.excerpt,
      order: storyDef.order,
      modules,
      ...(thumbnail && { thumbnail }),
    };

    const result = await client.create(doc);
    console.log(`  ✅ Created: ${result._id}`);
  }

  console.log('\n\n✅ All done!');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
