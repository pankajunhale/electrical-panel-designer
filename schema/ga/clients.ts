import { z } from "zod";

export const clientsSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be 100 characters or l ess"),
  address: z.string().optional(),
  contact_email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be 100 characters or less")
    .optional(),
  contact_number: z
    .string()
    .max(20, "Contact number must be 20 characters or less")
    .optional(),
});

export type ClientsFormData = z.infer<typeof clientsSchema>;
