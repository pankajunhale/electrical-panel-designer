"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { makeDetailsSchema, MakeDetailsFormData } from "@/schema/make-details";
import { submitMakeDetails } from "@/actions/make-details";
import { useActionState } from "react";

const SFU_OPTIONS = ["Siemens_3KL", "L&T", "ABB"];
const MCCB_OPTIONS = ["Siemens_3VT", "L&T", "ABB"];
const ACB_OPTIONS = ["Siemens_3WT_3WL", "L&T", "ABB"];
const MPCB_OPTIONS = ["Siemens_3RV", "L&T", "ABB"];
const CONTACTOR_OPTIONS = ["Siemens_3RT", "L&T", "ABB"];
const METER_OPTIONS = ["Conzerv", "Teknik", "EPCOS"];
const PILOT_DEVICE_OPTIONS = ["Teknik", "Conzerv", "EPCOS"];
const CAPACITOR_OPTIONS = ["EPCOS", "Conzerv", "Teknik"];

export function MakeDetailsForm({
  onSubmit,
}: {
  onSubmit?: (data: MakeDetailsFormData) => void;
}) {
  const [state] = useActionState(submitMakeDetails, {
    errors: {},
    message: "",
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MakeDetailsFormData>({
    resolver: zodResolver(makeDetailsSchema),
    defaultValues: {
      sfu: SFU_OPTIONS[0],
      mccb: MCCB_OPTIONS[0],
      acb: ACB_OPTIONS[0],
      mpcb: MPCB_OPTIONS[0],
      contactor: CONTACTOR_OPTIONS[0],
      meter: METER_OPTIONS[0],
      pilotDevice: PILOT_DEVICE_OPTIONS[0],
      capacitor: CAPACITOR_OPTIONS[0],
    },
  });

  const handleFormSubmit = async (data: MakeDetailsFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const result = await submitMakeDetails(
      { errors: {}, message: "" },
      formData
    );
    if (result.data && onSubmit) {
      onSubmit(result.data);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">SFUs</label>
          <Select
            value={watch("sfu")}
            onValueChange={(val) => setValue("sfu", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select SFU" />
            </SelectTrigger>
            <SelectContent>
              {SFU_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sfu && (
            <p className="text-red-500 text-xs mt-1">{errors.sfu.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">MCCBs</label>
          <Select
            value={watch("mccb")}
            onValueChange={(val) => setValue("mccb", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select MCCB" />
            </SelectTrigger>
            <SelectContent>
              {MCCB_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.mccb && (
            <p className="text-red-500 text-xs mt-1">{errors.mccb.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">ACBs</label>
          <Select
            value={watch("acb")}
            onValueChange={(val) => setValue("acb", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ACB" />
            </SelectTrigger>
            <SelectContent>
              {ACB_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.acb && (
            <p className="text-red-500 text-xs mt-1">{errors.acb.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">MPCBs</label>
          <Select
            value={watch("mpcb")}
            onValueChange={(val) => setValue("mpcb", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select MPCB" />
            </SelectTrigger>
            <SelectContent>
              {MPCB_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.mpcb && (
            <p className="text-red-500 text-xs mt-1">{errors.mpcb.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Contactors</label>
          <Select
            value={watch("contactor")}
            onValueChange={(val) => setValue("contactor", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Contactor" />
            </SelectTrigger>
            <SelectContent>
              {CONTACTOR_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contactor && (
            <p className="text-red-500 text-xs mt-1">
              {errors.contactor.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Meters</label>
          <Input {...register("meter")} placeholder="Conzerv" />
          {errors.meter && (
            <p className="text-red-500 text-xs mt-1">{errors.meter.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Pilot Devices</label>
          <Input {...register("pilotDevice")} placeholder="Teknik" />
          {errors.pilotDevice && (
            <p className="text-red-500 text-xs mt-1">
              {errors.pilotDevice.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Capacitors</label>
          <Input {...register("capacitor")} placeholder="EPCOS" />
          {errors.capacitor && (
            <p className="text-red-500 text-xs mt-1">
              {errors.capacitor.message}
            </p>
          )}
        </div>
      </div>
      {state.message && (
        <p className="text-green-600 text-sm">{state.message}</p>
      )}
      <Button type="submit" className="mt-4">
        Next
      </Button>
    </form>
  );
}
