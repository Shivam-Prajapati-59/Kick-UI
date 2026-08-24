import { z } from "zod";
import {
  componentCategories,
  type ComponentCategory,
} from "./component-categories.ts";

/**
 * Canonical frontmatter schema for component docs.
 *
 * Single source of truth shared by:
 *  - scripts/build-docs.mjs (build-time validation + index generation)
 *  - scripts/build-registry.mjs (registry metadata)
 *  - src/lib/component-docs.ts (runtime docs reader)
 */

export const categorySchema = z.enum(
  componentCategories.map((category) => category.id) as [
    ComponentCategory,
    ...ComponentCategory[],
  ],
);

const baseComponentDocSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: categorySchema,
  demo: z.string().min(1),
  usage: z.string().default(""),
  props: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        default: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  fullPreview: z.boolean().default(false),
});

export const componentDocSchema = baseComponentDocSchema;

export type ComponentDocFrontmatter = z.infer<typeof componentDocSchema>;

/** Schema factory that additionally validates `demo` against registered demos. */
export function createComponentDocSchema(demoNames: ReadonlySet<string>) {
  return baseComponentDocSchema.extend({
    demo: z
      .string()
      .min(1)
      .refine((demo) => demoNames.has(demo), {
        message: "Demo must reference a registered runtime demo.",
      }),
  });
}
