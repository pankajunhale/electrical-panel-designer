import { z } from "zod";

export const slConfigSchema = z.object({
  panel_id: z.number().optional(),
  config_json: z.string().optional(), // JSONB in DB, but we'll handle as string
});

export type SlConfigFormData = z.infer<typeof slConfigSchema>;
