import { z } from "zod";

export const feederIncomerTypesSchema = z.object({
  feeders: z.array(
    z.object({
      incomerType: z.string().min(1, "Required"),
      phase: z.string().min(1, "Required"),
      incomerKA: z.string().min(1, "Required"),
      meterRequired: z.object({ amp: z.boolean() }),
      alBusBars: z.string().min(1, "Required"),
    })
  ),
});

export type FeederIncomerTypesFormData = z.infer<
  typeof feederIncomerTypesSchema
>;
