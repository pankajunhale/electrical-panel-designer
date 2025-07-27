import { z } from "zod";

export const feedersSchema = z.object({
  panel_id: z.number().optional(),
  description: z.string().optional(),
  rating_kw: z.number().optional(),
  rating_hp: z.number().optional(),
  starter_type_id: z.number().optional(),
  feeder_type_id: z.number().optional(),
  source_type_id: z.number().optional(),
  breaker_type_id: z.number().optional(),
  quantity: z.number().optional(),
});

export type FeedersFormData = z.infer<typeof feedersSchema>;
