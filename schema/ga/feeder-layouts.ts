import { z } from "zod";

export const feederLayoutsSchema = z.object({
  feeder_id: z.number().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  view_type: z.enum(["front", "rear"]).optional(),
});

export type FeederLayoutsFormData = z.infer<typeof feederLayoutsSchema>;
