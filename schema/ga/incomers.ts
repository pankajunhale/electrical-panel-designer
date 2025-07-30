import { z } from "zod";

// Incomer validation schemas
export const IncomerCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Incomer name is required")
    .max(100, "Incomer name must be less than 100 characters"),
  ampereRating: z.number().min(1, "Ampere rating is required"),
});

export const IncomerUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Incomer name is required")
    .max(100, "Incomer name must be less than 100 characters")
    .optional(),
  ampereRating: z.number().nullable().optional(),
});

// Type exports
export type IncomerCreateInput = z.infer<typeof IncomerCreateSchema>;
export type IncomerUpdateInput = z.infer<typeof IncomerUpdateSchema>;

// Form data type for incomer creation
export type IncomersFormData = {
  name: string;
  ampereRating: number;
  panelId: string;
};

// Form schema for incomer creation (without server-side fields)
export const IncomerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Incomer name is required")
    .max(100, "Incomer name must be less than 100 characters"),
  ampereRating: z.number().min(1, "Ampere rating is required"),
  panelId: z.string().min(1, "Panel is required"),
});

// Legacy schema export for backward compatibility
export const incomersSchema = IncomerFormSchema;

// Validation helper functions
export const validateIncomerCreate = (data: unknown) => {
  return IncomerCreateSchema.safeParse(data);
};

export const validateIncomerUpdate = (data: unknown) => {
  return IncomerUpdateSchema.safeParse(data);
};
