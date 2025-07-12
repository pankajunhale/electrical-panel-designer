import { z } from "zod";

export const incomerTypesSchema = z.object({
  incomers: z.array(
    z.object({
      incomerType: z.string().min(1, "Required"),
      phase: z.string().min(1, "Required"),
      incomerKA: z.string().min(1, "Required"),
      metersRequired: z.object({
        amp: z.boolean(),
        volt: z.boolean(),
        kwh: z.boolean(),
        lm: z.boolean(),
      }),
      busCouplerType: z.string().min(1, "Required"),
      alBusBars: z.string().min(1, "Required"),
      cuCables: z.string().min(1, "Required"),
    })
  ),
});

export type IncomerTypesFormData = z.infer<typeof incomerTypesSchema>;
