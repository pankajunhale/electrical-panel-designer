import { z } from "zod";

export const incomerDetailsSchema = z.object({
  incomers: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      ampereRating: z.number(),
    })
  ),
  feeders: z.array(
    z.object({
      name: z.string().min(1, "Feeder Name is required"),
      starterType: z.string().min(1, "Starter Type is required"),
      feederAmps: z.number(),
      connectToIncomer: z.string().min(1, "Connect to Incomer is required"),
    })
  ),
});

export type IncomerDetailsIncomer = z.infer<
  typeof incomerDetailsSchema.shape.incomers.element
>;
export type IncomerDetailsFeeder = z.infer<
  typeof incomerDetailsSchema.shape.feeders.element
>;
export type IncomerDetailsFormData = z.infer<typeof incomerDetailsSchema>;
