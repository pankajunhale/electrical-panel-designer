import { z } from "zod";

export const makeDetailsSchema = z.object({
  sfu: z.string().min(1, "Required"),
  mccb: z.string().min(1, "Required"),
  acb: z.string().min(1, "Required"),
  mpcb: z.string().min(1, "Required"),
  contactor: z.string().min(1, "Required"),
  meter: z.string().min(1, "Required"),
  pilotDevice: z.string().min(1, "Required"),
  capacitor: z.string().min(1, "Required"),
});

export type MakeDetailsFormData = z.infer<typeof makeDetailsSchema>;
