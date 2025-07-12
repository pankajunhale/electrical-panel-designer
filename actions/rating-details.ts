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
  // Extract rating data from FormData
  const incomerRatings = [];
  const feederRatings = [];

  let incomerIndex = 0;
  while (formData.get(`incomerRatings[${incomerIndex}].rating`)) {
    const rating = {
      rating: formData.get(`incomerRatings[${incomerIndex}].rating`) as string,
      type: formData.get(`incomerRatings[${incomerIndex}].type`) as string,
    };
    incomerRatings.push(rating);
    incomerIndex++;
  }

  let feederIndex = 0;
  while (formData.get(`feederRatings[${feederIndex}].rating`)) {
    const rating = {
      rating: formData.get(`feederRatings[${feederIndex}].rating`) as string,
      type: formData.get(`feederRatings[${feederIndex}].type`) as string,
    };
    feederRatings.push(rating);
    feederIndex++;
  }

  const data = { incomerRatings, feederRatings };

  const validatedFields = ratingDetailsSchema.safeParse(data);

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
