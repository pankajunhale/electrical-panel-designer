import { z } from "zod";

export const ratingDetailsSchema = z.object({
  incomers: z.array(
    z.object({
      currentRating: z.string().min(1, "Required"),
      wiringMaterial: z.enum(["Copper", "Aluminum"]),
      cablesOrBusBars: z.enum(["Cables", "BusBars"]),
    })
  ),
  feeders: z.array(
    z.object({
      currentRating: z.string().min(1, "Required"),
      wiringMaterial: z.enum(["Copper", "Aluminum"]),
      cablesOrBusBars: z.enum(["Cables", "BusBars"]),
    })
  ),
});

export type RatingDetailsFormData = z.infer<typeof ratingDetailsSchema>;
