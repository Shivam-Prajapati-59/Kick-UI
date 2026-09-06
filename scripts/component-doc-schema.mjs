import { z } from "zod";
import { categoryIds } from "./lib/categories.mjs";

/**
 * Single frontmatter contract for content MDX docs.
 * Identity comes from the filename (slug); the demo is derived from the
 * same slug via the src/demos/<slug>.tsx convention, so no `demo` field.
 * Docs without a distributable source set `distributable: false`.
 */
export const componentDocSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(categoryIds),
  usage: z.string().default(""),
  props: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    default: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
  fullPreview: z.boolean().default(false),
  distributable: z.boolean().default(true),
});
