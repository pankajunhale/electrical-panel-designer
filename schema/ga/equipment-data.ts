import { z } from "zod";

export const equipmentDataSchema = z.object({
  panel_id: z.number().optional(),
  serial_number: z.number().min(1, "Serial number is required"),
  description: z.string().min(1, "Description is required"),
  rating_kw: z.number().optional(),
  rating_hp: z.number().optional(),
  starter_type_id: z.number().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  total_load_kw: z.number().optional(),
  equipment_type_id: z.number().optional(),
});

export type EquipmentDataFormData = z.infer<typeof equipmentDataSchema>;
