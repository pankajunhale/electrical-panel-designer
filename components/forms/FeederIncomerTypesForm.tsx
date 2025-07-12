"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  feederIncomerTypesSchema,
  FeederIncomerTypesFormData,
} from "@/schema/feeder-incomer-types";
import { useEffect, useState } from "react";

const INCOMER_TYPES = ["MCB", "MCCB", "SFU"];
const PHASES = ["1P", "3P"];

type Feeder = {
  incomerType: string;
  phase: string;
  incomerKA: string;
  meterRequired: { amp: boolean };
  alBusBars: string;
};

interface FeederIncomerTypesFormProps {
  onNext: (data: { feeders: Feeder[] }) => void;
  onBack: () => void;
  initialData?: { feeders: Feeder[] };
  isLoading?: boolean;
  numberOfFeeders: number;
}

export function FeederIncomerTypesForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
  numberOfFeeders,
}: FeederIncomerTypesFormProps) {
  const [feeders, setFeeders] = useState<Feeder[]>(
    Array.from({ length: numberOfFeeders }, (_, i) => ({
      incomerType: initialData?.feeders?.[i]?.incomerType || "MCB",
      phase: initialData?.feeders?.[i]?.phase || "3P",
      incomerKA: initialData?.feeders?.[i]?.incomerKA || "25",
      meterRequired: initialData?.feeders?.[i]?.meterRequired || { amp: false },
      alBusBars: initialData?.feeders?.[i]?.alBusBars || "25",
    }))
  );

  useEffect(() => {
    setFeeders(
      Array.from({ length: numberOfFeeders }, (_, i) => ({
        incomerType: initialData?.feeders?.[i]?.incomerType || "MCB",
        phase: initialData?.feeders?.[i]?.phase || "3P",
        incomerKA: initialData?.feeders?.[i]?.incomerKA || "25",
        meterRequired: initialData?.feeders?.[i]?.meterRequired || {
          amp: false,
        },
        alBusBars: initialData?.feeders?.[i]?.alBusBars || "25",
      }))
    );
  }, [numberOfFeeders, initialData]);

  const form = useForm<FeederIncomerTypesFormData>({
    resolver: zodResolver(feederIncomerTypesSchema),
    defaultValues: { feeders },
    values: { feeders },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = form;

  useEffect(() => {
    setValue("feeders", feeders);
  }, [feeders, setValue]);

  const onChange = (idx: number, field: string, value: unknown) => {
    setFeeders((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };
  const onChangeMeter = (idx: number, checked: boolean) => {
    setFeeders((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, meterRequired: { amp: checked } } : item
      )
    );
  };

  const onSubmit = (data: FeederIncomerTypesFormData) => {
    onNext(data);
  };

  // Responsive grid: max 4 columns, use actual count for fewer items
  const gridCols = Math.min(numberOfFeeders, 4);
  const gridClass = `grid grid-cols-1 sm:grid-cols-${Math.min(
    2,
    gridCols
  )} md:grid-cols-${Math.min(3, gridCols)} lg:grid-cols-${gridCols} gap-4`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span className="inline-block">
            <svg width="20" height="20" fill="none" stroke="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          Feeder Incomer Types
        </h2>
        <div className={gridClass}>
          {feeders.map((item, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-center font-semibold rounded-t">
                  {`Feeder No. ${idx + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Incomer Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.incomerType}
                    onValueChange={(val) => onChange(idx, "incomerType", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOMER_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeders?.[idx]?.incomerType && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.incomerType?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Phase <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.phase}
                    onValueChange={(val) => onChange(idx, "phase", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeders?.[idx]?.phase && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.phase?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Incomer kA <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={item.incomerKA}
                    onChange={(e) => onChange(idx, "incomerKA", e.target.value)}
                  />
                  {errors.feeders?.[idx]?.incomerKA && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.incomerKA?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Meter Required</Label>
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-1 text-xs">
                      <Checkbox
                        checked={item.meterRequired.amp}
                        onCheckedChange={(val) => onChangeMeter(idx, !!val)}
                      />
                      Amp
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    Al Bus Bars (sqmm) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={item.alBusBars}
                    onChange={(e) => onChange(idx, "alBusBars", e.target.value)}
                  />
                  {errors.feeders?.[idx]?.alBusBars && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.alBusBars?.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading || !isValid}>
          {isSubmitting || isLoading ? (
            <span className="flex items-center gap-2">
              <span className="loader spinner-border spinner-border-sm"></span>{" "}
              Saving...
            </span>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </form>
  );
}
