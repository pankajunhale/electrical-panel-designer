import { z } from "zod";

export const feederIncomerTypesSchema = z.object({
  feeders: z.array(
    z.object({
      incomerType: z.string().min(1, "Required"),
      phase: z.string().min(1, "Required"),
      incomerKA: z.number(),
      meterRequired: z.object({ amp: z.boolean() }),
      alBusBars: z.number(),
    })
  ),
});

export type FeederIncomerTypesFormData = z.infer<
  typeof feederIncomerTypesSchema
>;
