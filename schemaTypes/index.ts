import { work, mediaBlock, textBlock, spacerBlock } from "./work";
import { workCategory } from "./workCategory";
import { storyCategory } from "./storyCategory";
import {
  story,
  storyMediaBlock,
  storyTextBlock,
  storySpacerBlock,
  storyHeroModule,
  codeBlock,
  storyTechStack,
  // Legacy (backward compat)
  storyMediaModule,
  storyTwoColImageModule,
  storyTextModule,
} from "./story";

export const schemaTypes = [
  // Documents
  work,
  story,
  workCategory,
  storyCategory,

  // Work object types (3-module system)
  mediaBlock,
  textBlock,
  spacerBlock,

  // Story object types (aligned with frontend StorySingle)
  storyMediaBlock,
  storyTextBlock,
  storySpacerBlock,
  storyHeroModule,
  codeBlock,
  storyTechStack,

  // Legacy story modules (kept so existing documents still validate)
  storyMediaModule,
  storyTwoColImageModule,
  storyTextModule,
];
