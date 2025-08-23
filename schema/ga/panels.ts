import { z } from "zod";

// Panel validation schemas
export const PanelCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Panel name is required")
    .max(100, "Panel name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  voltageLevel: z
    .string()
    .min(1, "Voltage level is required")
    .max(50, "Voltage level must be less than 50 characters"),
  width: z.string().min(1, "Width is required"),
  height: z.string().min(1, "Height is required"),
  depth: z.string().min(1, "Depth is required"),
  locationId: z.string().min(1, "Location ID is required"),
  frontViewUrl: z.string().min(1, "Front view URL is required"),
  rearViewUrl: z.string().min(1, "Rear view URL is required"),
  status: z
    .string()
    .min(1, "Status is required")
    .max(20, "Status must be less than 20 characters"),
  projectId: z.string().min(1, "Project ID is required"),
});

export const PanelUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Panel name is required")
    .max(100, "Panel name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  voltageLevel: z
    .string()
    .min(1, "Voltage level is required")
    .max(50, "Voltage level must be less than 50 characters")
    .optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  depth: z.string().optional(),
  locationId: z.string().optional(),
  frontViewUrl: z.string().optional(),
  rearViewUrl: z.string().optional(),
  status: z
    .string()
    .min(1, "Status is required")
    .max(20, "Status must be less than 20 characters")
    .optional(),
  projectId: z.string().min(1, "Project ID is required").optional(),
});

// Type exports
export type PanelCreateInput = z.infer<typeof PanelCreateSchema>;
export type PanelUpdateInput = z.infer<typeof PanelUpdateSchema>;

// Form data type for panel creation
export type PanelsFormData = {
  name: string;
  description: string;
  voltageLevel: string;
  width: string;
  height: string;
  depth: string;
  locationId: string;
  frontViewUrl: string;
  rearViewUrl: string;
  status: string;
  projectId: string;
};

// Form schema for panel creation (without server-side fields)
export const PanelFormSchema = z.object({
  name: z
    .string()
    .min(1, "Panel name is required")
    .max(100, "Panel name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  voltageLevel: z
    .string()
    .min(1, "Voltage level is required")
    .max(50, "Voltage level must be less than 50 characters"),
  width: z.string().min(1, "Width is required"),
  height: z.string().min(1, "Height is required"),
  depth: z.string().min(1, "Depth is required"),
  locationId: z.string().min(1, "Location ID is required"),
  frontViewUrl: z.string().min(1, "Front view URL is required"),
  rearViewUrl: z.string().min(1, "Rear view URL is required"),
  status: z
    .string()
    .min(1, "Status is required")
    .max(20, "Status must be less than 20 characters"),
  projectId: z.string().min(1, "Project ID is required"),
});

// Legacy schema export for backward compatibility
export const panelsSchema = PanelFormSchema;

// Validation helper functions
export const validatePanelCreate = (data: unknown) => {
  return PanelCreateSchema.safeParse(data);
};

export const validatePanelUpdate = (data: unknown) => {
  return PanelUpdateSchema.safeParse(data);
};
