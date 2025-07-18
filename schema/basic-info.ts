import { z } from "zod";

export const basicInfoSchema = z.object({
  // System Details
  supplyLineVoltage: z.number(),
  supplySystem: z.string().min(1, "Supply System is required"),
  controlVoltage: z.number(),
  panelType: z.string().min(1, "Panel Type is required"),
  numberOfIncomers: z.number(),
  numberOfOutgoingFeeders: z.number(),
  saveAsDefault: z.boolean().optional(),

  // Drawing Details
  title: z.string().min(1, "Title is required"),
  drawingNo: z.string().min(1, "Drawing No. is required"),
  author: z.string().min(1, "Author is required"),
  company: z.string().min(1, "Company is required"),
  customer: z.string().min(1, "Customer is required"),
  colorFormat: z.enum(["Colored", "Monochrome"]),
  ferrulPrefix: z
    .string()
    .regex(
      /^[0-9A-Z]$/,
      "Ferrul Prefix must be a single digit or uppercase letter"
    ),

  // Make Details
  sfu: z.string().min(1, "SFU make is required"),
  mccb: z.string().min(1, "MCCB make is required"),
  acb: z.string().min(1, "ACB make is required"),
  mpcb: z.string().min(1, "MPCB make is required"),
  contactor: z.string().min(1, "Contactor make is required"),
  meter: z.string().min(1, "Meter make is required"),
  pilotDevice: z.string().min(1, "Pilot Device make is required"),
  capacitor: z.string().min(1, "Capacitor make is required"),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
