"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  incomerTypesSchema,
  IncomerTypesFormData,
} from "@/schema/incomer-types";
import { useEffect, useState } from "react";
import { FeederIncomerTypesForm } from "./FeederIncomerTypesForm";

const INCOMER_TYPES = ["MCCB", "ACB", "SFU"];
const PHASES = ["1P", "3P"];
const BUS_COUPLER_TYPES = ["MCCB", "ACB", "None"];

interface IncomerTypesFormProps {
  onNext: (data: {
    incomers: IncomerTypesFormData["incomers"];
    feeders: unknown[];
  }) => void;
  onBack: () => void;
  initialData?: {
    incomers: IncomerTypesFormData["incomers"];
    feeders: unknown[];
  };
  isLoading?: boolean;
  numberOfIncomers: number;
  numberOfFeeders: number;
}

export function IncomerTypesForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
  numberOfIncomers,
  numberOfFeeders,
}: IncomerTypesFormProps) {
  const [incomers, setIncomers] = useState(
    Array.from({ length: numberOfIncomers }, (_, i) => ({
      incomerType: initialData?.incomers?.[i]?.incomerType || "MCCB",
      phase: initialData?.incomers?.[i]?.phase || "3P",
      incomerKA: initialData?.incomers?.[i]?.incomerKA || "25",
      metersRequired: initialData?.incomers?.[i]?.metersRequired || {
        amp: false,
        volt: false,
        kwh: false,
        lm: false,
      },
      busCouplerType: initialData?.incomers?.[i]?.busCouplerType || "MCCB",
      alBusBars: initialData?.incomers?.[i]?.alBusBars || "150",
      cuCables: initialData?.incomers?.[i]?.cuCables || "50",
    }))
  );

  useEffect(() => {
    setIncomers(
      Array.from({ length: numberOfIncomers }, (_, i) => ({
        incomerType: initialData?.incomers?.[i]?.incomerType || "MCCB",
        phase: initialData?.incomers?.[i]?.phase || "3P",
        incomerKA: initialData?.incomers?.[i]?.incomerKA || "25",
        metersRequired: initialData?.incomers?.[i]?.metersRequired || {
          amp: false,
          volt: false,
          kwh: false,
          lm: false,
        },
        busCouplerType: initialData?.incomers?.[i]?.busCouplerType || "MCCB",
        alBusBars: initialData?.incomers?.[i]?.alBusBars || "150",
        cuCables: initialData?.incomers?.[i]?.cuCables || "50",
      }))
    );
  }, [numberOfIncomers, initialData]);

  const form = useForm<IncomerTypesFormData>({
    resolver: zodResolver(incomerTypesSchema),
    defaultValues: { incomers },
    values: { incomers },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  useEffect(() => {
    setValue("incomers", incomers);
  }, [incomers, setValue]);

  const onChange = (idx: number, field: string, value: string) => {
    setIncomers((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };
  const onChangeMeter = (idx: number, meter: string, checked: boolean) => {
    setIncomers((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              metersRequired: { ...item.metersRequired, [meter]: checked },
            }
          : item
      )
    );
  };

  const [feederSectionData, setFeederSectionData] = useState<unknown[]>([]);

  const handleFeederNext = (data: { feeders: unknown[] }) => {
    setFeederSectionData(data.feeders);
    onNext({ incomers, feeders: data.feeders });
  };

  // Responsive grid: max 4 columns, use actual count for fewer items
  const gridCols = Math.min(numberOfIncomers, 4);
  const gridClass = `grid grid-cols-1 sm:grid-cols-${Math.min(
    2,
    gridCols
  )} md:grid-cols-${Math.min(3, gridCols)} lg:grid-cols-${gridCols} gap-4`;

  return (
    <>
      <form onSubmit={handleSubmit(() => {})} className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            Incomer Types
          </h2>
          <div className={gridClass}>
            {incomers.map((item, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Incomer {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                    {errors.incomers?.[idx]?.incomerType && (
                      <p className="text-xs text-destructive">
                        {errors.incomers[idx]?.incomerType?.message}
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
                    {errors.incomers?.[idx]?.phase && (
                      <p className="text-xs text-destructive">
                        {errors.incomers[idx]?.phase?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Incomer kA <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={item.incomerKA}
                      onChange={(e) =>
                        onChange(idx, "incomerKA", e.target.value)
                      }
                    />
                    {errors.incomers?.[idx]?.incomerKA && (
                      <p className="text-xs text-destructive">
                        {errors.incomers[idx]?.incomerKA?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Meters Required</Label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(item.metersRequired).map(
                        ([meter, checked]) => (
                          <label
                            key={meter}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Checkbox
                              checked={checked as boolean}
                              onCheckedChange={(val) =>
                                onChangeMeter(idx, meter, !!val)
                              }
                            />
                            {meter.toUpperCase()}
                          </label>
                        )
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Bus Coupler Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={item.busCouplerType}
                      onValueChange={(val) =>
                        onChange(idx, "busCouplerType", val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUS_COUPLER_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.incomers?.[idx]?.busCouplerType && (
                      <p className="text-xs text-destructive">
                        {errors.incomers[idx]?.busCouplerType?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Al Bus Bars (sqmm) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={item.alBusBars}
                      onChange={(e) =>
                        onChange(idx, "alBusBars", e.target.value)
                      }
                    />
                    {errors.incomers?.[idx]?.alBusBars && (
                      <p className="text-xs text-destructive">
                        {errors.incomers[idx]?.alBusBars?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Cu Cables (sqmm) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={item.cuCables}
                      onChange={(e) =>
                        onChange(idx, "cuCables", e.target.value)
                      }
                    />
                    {errors.incomers?.[idx]?.cuCables && (
                      <p className="text-xs text-destructive">
                        {errors.incomers[idx]?.cuCables?.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </form>
      {/* Feeder Incomer Types Section */}
      <FeederIncomerTypesForm
        onNext={handleFeederNext}
        onBack={onBack}
        initialData={{ feeders: feederSectionData }}
        isLoading={isLoading}
        numberOfFeeders={numberOfFeeders}
      />
    </>
  );
}
