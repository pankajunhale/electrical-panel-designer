import { z } from "zod";

export const panelDetailsSchema = z.object({
  maxHeightFeedersSection: z
    .number()
    .min(700, "Min 700mm")
    .max(2500, "Max 2500mm"),
  panelDoorsThickness: z.number().min(0.1, "Required"),
  mountingPlatesThickness1: z.number().min(0.1, "Required"),
  mountingPlatesThickness2: z.number().min(0.1, "Required"),
  verticalHorizPartitionsThickness: z.number().min(0.1, "Required"),
  horizontalPartitionRequired: z.boolean(),
  verticalPartitionRequired: z.boolean(),
  horizontalPartitionsDepth: z.number().min(0.1, "Required"),
  verticalPartitionsDepth: z.number().min(0.1, "Required"),
});

export type PanelDetailsFormData = z.infer<typeof panelDetailsSchema>;
