import { z } from "zod";

export const systemDetailsSchema = z.object({
  supplyLineVoltage: z.string().min(1, "Required"),
  supplySystem: z.string().min(1, "Required"),
  controlVoltage: z.string().min(1, "Required"),
  panelType: z.string().min(1, "Required"),
  numberOfIncomers: z.string().min(1, "Required"),
  numberOfOutgoingFeeders: z.string().min(1, "Required"),
  saveAsDefault: z.boolean().optional(),
});

export type SystemDetailsFormData = z.infer<typeof systemDetailsSchema>;
