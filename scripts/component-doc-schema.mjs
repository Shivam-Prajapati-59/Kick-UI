import { z } from "zod";

const baseComponentDocSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum([
    "buttons",
    "cards",
    "components",
    "text-animations",
    "layouts-sections",
    "animations",
  ]),
  demo: z.string().min(1),
  usage: z.string().default(""),
  props: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    default: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
  fullPreview: z.boolean().default(false),
});

export const componentDocSchema = baseComponentDocSchema;

export function createComponentDocSchema(demoNames) {
  return baseComponentDocSchema.extend({
    demo: z.string().min(1).refine((demo) => demoNames.has(demo), {
      message: "Demo must reference a registered runtime demo.",
    }),
  });
}
