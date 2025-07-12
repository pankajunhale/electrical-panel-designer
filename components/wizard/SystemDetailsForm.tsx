"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const systemDetailsSchema = z.object({
  supplyLineVoltage: z.string().min(1, "Required"),
  supplySystem: z.string().min(1, "Required"),
  controlVoltage: z.string().min(1, "Required"),
  panelType: z.string().min(1, "Required"),
  numberOfIncomers: z.string().min(1, "Required"),
  numberOfOutgoingFeeders: z.string().min(1, "Required"),
  saveAsDefault: z.boolean().optional(),
});

type SystemDetailsFormData = z.infer<typeof systemDetailsSchema>;

const SUPPLY_SYSTEMS = [
  "3 Phase 4 Wire, 50Hz",
  "3 Phase 3 Wire, 50Hz",
  "1 Phase 2 Wire, 50Hz",
];
const PANEL_TYPES = [
  "MCC Panel",
  "PCC Panel",
  "APFC Panel",
  "Distribution Panel",
];

export function SystemDetailsForm({
  onSubmit,
}: {
  onSubmit: (data: SystemDetailsFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SystemDetailsFormData>({
    resolver: zodResolver(systemDetailsSchema),
    defaultValues: {
      supplySystem: SUPPLY_SYSTEMS[0],
      panelType: PANEL_TYPES[0],
      saveAsDefault: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Supply Line Voltage</label>
          <Input {...register("supplyLineVoltage")} placeholder="415" />
          {errors.supplyLineVoltage && (
            <p className="text-red-500 text-xs mt-1">
              {errors.supplyLineVoltage.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Supply System</label>
          <Select
            value={watch("supplySystem")}
            onValueChange={(val) => setValue("supplySystem", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select system" />
            </SelectTrigger>
            <SelectContent>
              {SUPPLY_SYSTEMS.map((sys) => (
                <SelectItem key={sys} value={sys}>
                  {sys}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.supplySystem && (
            <p className="text-red-500 text-xs mt-1">
              {errors.supplySystem.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Control Voltage</label>
          <Input {...register("controlVoltage")} placeholder="240" />
          {errors.controlVoltage && (
            <p className="text-red-500 text-xs mt-1">
              {errors.controlVoltage.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Panel Type</label>
          <Select
            value={watch("panelType")}
            onValueChange={(val) => setValue("panelType", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select panel type" />
            </SelectTrigger>
            <SelectContent>
              {PANEL_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.panelType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.panelType.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Number of Incomers</label>
          <Input
            {...register("numberOfIncomers")}
            placeholder="6"
            type="number"
            min={1}
          />
          {errors.numberOfIncomers && (
            <p className="text-red-500 text-xs mt-1">
              {errors.numberOfIncomers.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">
            No. of Outgoing Feeders
          </label>
          <Input
            {...register("numberOfOutgoingFeeders")}
            placeholder="4"
            type="number"
            min={1}
          />
          {errors.numberOfOutgoingFeeders && (
            <p className="text-red-500 text-xs mt-1">
              {errors.numberOfOutgoingFeeders.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveAsDefault"
          checked={watch("saveAsDefault")}
          onCheckedChange={(val) => setValue("saveAsDefault", !!val)}
        />
        <label htmlFor="saveAsDefault" className="font-medium">
          Save Settings as Default
        </label>
      </div>
      <Button type="submit" className="mt-4">
        Next
      </Button>
    </form>
  );
}
