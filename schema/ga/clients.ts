import { z } from "zod";

// Client validation schemas
export const ClientCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be less than 100 characters"),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters")
    .optional(),
  contactNumber: z
    .string()
    .max(20, "Contact number must be less than 20 characters")
    .regex(/^[\+]?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .optional(),
  userId: z.string().uuid("Invalid user ID").optional(),
  teamId: z.string().uuid("Invalid team ID").optional(),
  createdBy: z.string().uuid("Created by user ID is required"),
});

export const ClientUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be less than 100 characters")
    .optional(),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters")
    .nullable()
    .optional(),
  contactNumber: z
    .string()
    .max(20, "Contact number must be less than 20 characters")
    .regex(/^[\+]?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .nullable()
    .optional(),
  userId: z.string().uuid("Invalid user ID").nullable().optional(),
  teamId: z.string().uuid("Invalid team ID").nullable().optional(),
  updatedBy: z.string().uuid("Updated by user ID is required"),
});

export const ClientQuerySchema = z.object({
  teamId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const ClientFiltersSchema = z.object({
  teamId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  hasProjects: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export const ClientSortSchema = z.object({
  sortBy: z
    .enum(["name", "createdAt", "updatedAt", "projectCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type ClientCreateInput = z.infer<typeof ClientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof ClientUpdateSchema>;
export type ClientQueryInput = z.infer<typeof ClientQuerySchema>;
export type ClientFiltersInput = z.infer<typeof ClientFiltersSchema>;
export type ClientSortInput = z.infer<typeof ClientSortSchema>;

// Legacy export for backward compatibility
export type ClientsFormData = ClientCreateInput;

// Validation helper functions
export const validateClientCreate = (data: unknown) => {
  return ClientCreateSchema.safeParse(data);
};

export const validateClientUpdate = (data: unknown) => {
  return ClientUpdateSchema.safeParse(data);
};

export const validateClientQuery = (data: unknown) => {
  return ClientQuerySchema.safeParse(data);
};

export const validateClientFilters = (data: unknown) => {
  return ClientFiltersSchema.safeParse(data);
};

export const validateClientSort = (data: unknown) => {
  return ClientSortSchema.safeParse(data);
};

// Legacy schema export for backward compatibility
export const clientsSchema = ClientCreateSchema;
