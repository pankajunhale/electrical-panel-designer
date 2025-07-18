"use server";

import {
  ratingDetailsSchema,
  type RatingDetailsFormData,
} from "@/schema/rating-details";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: RatingDetailsFormData;
};

export async function submitRatingDetails(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  console.log(formData);
  // Extract rating data from FormData
  let incomers: Array<{
    currentRating: string;
    wiringMaterial: string;
    cablesOrBusBars: string;
  }> = [];
  let feeders: Array<{
    currentRating: string;
    wiringMaterial: string;
    cablesOrBusBars: string;
  }> = [];

  if (formData.get("incomers")) {
    const tempIncomers = JSON.parse(formData.get("incomers") as string);
    incomers = tempIncomers.map(
      (incomer: {
        currentRating: string;
        wiringMaterial: string;
        cablesOrBusBars: string;
      }) => ({
        currentRating: incomer.currentRating,
        wiringMaterial: incomer.wiringMaterial,
        cablesOrBusBars: incomer.cablesOrBusBars,
      })
    );
  }
  if (formData.get("feeders")) {
    const tempFeeders = JSON.parse(formData.get("feeders") as string);
    feeders = tempFeeders.map(
      (feeder: {
        currentRating: string;
        wiringMaterial: string;
        cablesOrBusBars: string;
      }) => ({
        currentRating: feeder.currentRating,
        wiringMaterial: feeder.wiringMaterial,
        cablesOrBusBars: feeder.cablesOrBusBars,
      })
    );
  }
  const data = { incomers, feeders };
  console.log(data);
  const validatedFields = ratingDetailsSchema.safeParse(data);
  console.log(validatedFields);
  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};

    // Convert the field errors to the expected format
    Object.entries(validatedFields.error.flatten().fieldErrors).forEach(
      ([key, value]) => {
        fieldErrors[key] = value || [];
      }
    );

    return {
      errors: fieldErrors,
      message: "Invalid fields.",
    };
  }

  const ratingDetails = validatedFields.data;

  // Simulate success, skip database for now
  console.log("Rating details:", ratingDetails);
  return {
    errors: {},
    message: "Rating details submitted successfully!",
    data: ratingDetails,
  };
}
