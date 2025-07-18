import { z } from "zod";

export const systemDetailsSchema = z.object({
  supplyLineVoltage: z.number(),
  supplySystem: z.string().min(1, "Required"),
  controlVoltage: z.number(),
  panelType: z.string().min(1, "Required"),
  numberOfIncomers: z.number(),
  numberOfOutgoingFeeders: z.number(),
  saveAsDefault: z.boolean().optional(),
});

export type SystemDetailsFormData = z.infer<typeof systemDetailsSchema>;
