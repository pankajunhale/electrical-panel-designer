"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  incomerDetailsSchema,
  IncomerDetailsFormData,
} from "@/schema/incomer-details";
import { useState, useEffect, useMemo } from "react";

const STARTER_TYPES = [
  "Feeder Only",
  "DOL",
  "Star-Delta",
  "Soft Starter",
  "VFD",
];

interface IncomerDetailsFormProps {
  onNext: (data: IncomerDetailsFormData) => void;
  onBack: () => void;
  initialData?: IncomerDetailsFormData;
  isLoading?: boolean;
  numberOfIncomers: number;
  numberOfFeeders: number;
}

export function IncomerDetailsForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
  numberOfIncomers,
  numberOfFeeders,
}: IncomerDetailsFormProps) {
  // Initialize arrays with proper default values
  const initialIncomers = useMemo(() => {
    return Array.from({ length: numberOfIncomers }, (_, i) => ({
      name: `Incomer No. ${i + 1}`,
      ampereRating: initialData?.incomers?.[i]?.ampereRating || "100",
    }));
  }, [numberOfIncomers, initialData]);

  const initialFeeders = useMemo(() => {
    return Array.from({ length: numberOfFeeders }, (_, i) => ({
      name: `Feeder No. ${i + 1}`,
      starterType: initialData?.feeders?.[i]?.starterType || STARTER_TYPES[0],
      feederAmps: initialData?.feeders?.[i]?.feederAmps || "0.01",
      connectToIncomer:
        initialData?.feeders?.[i]?.connectToIncomer ||
        initialIncomers[0]?.name ||
        `Incomer No. 1`,
    }));
  }, [numberOfFeeders, initialData, initialIncomers]);

  const [incomers, setIncomers] = useState(initialIncomers);
  const [feeders, setFeeders] = useState(initialFeeders);

  // Update arrays when props change
  useEffect(() => {
    setIncomers(initialIncomers);
  }, [initialIncomers]);

  useEffect(() => {
    setFeeders(initialFeeders);
  }, [initialFeeders]);

  const form = useForm<IncomerDetailsFormData>({
    resolver: zodResolver(incomerDetailsSchema),
    defaultValues: { incomers: initialIncomers, feeders: initialFeeders },
    values: { incomers, feeders },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = form;

  useEffect(() => {
    setValue("incomers", incomers);
    setValue("feeders", feeders);
  }, [incomers, feeders, setValue]);

  const onChangeIncomerAmp = (idx: number, value: string) => {
    setIncomers((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, ampereRating: value } : item
      )
    );
  };
  const onChangeFeeder = (idx: number, field: string, value: string) => {
    setFeeders((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const onSubmit = (data: IncomerDetailsFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Incomer Details Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Incomer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomers.map((incomer, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-center font-semibold rounded-t">
                  {incomer.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`incomers.${idx}.name`}>
                    Incomer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`incomers.${idx}.name`}
                    value={incomer.name}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`incomers.${idx}.ampereRating`}>
                    Ampere Rating <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`incomers.${idx}.ampereRating`}
                    value={incomer.ampereRating}
                    onChange={(e) => onChangeIncomerAmp(idx, e.target.value)}
                  />
                  {errors.incomers?.[idx]?.ampereRating && (
                    <p className="text-xs text-destructive">
                      {errors.incomers[idx]?.ampereRating?.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Feeder Details Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Feeder Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeders.map((item, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-center font-semibold rounded-t">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`feeders.${idx}.name`}>
                    Feeder Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`feeders.${idx}.name`}
                    value={item.name}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feeders.${idx}.starterType`}>
                    Starter Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.starterType}
                    onValueChange={(val) =>
                      onChangeFeeder(idx, "starterType", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select starter type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STARTER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeders?.[idx]?.starterType && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.starterType?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feeders.${idx}.feederAmps`}>
                    Feeder Amps <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`feeders.${idx}.feederAmps`}
                    value={item.feederAmps}
                    onChange={(e) =>
                      onChangeFeeder(idx, "feederAmps", e.target.value)
                    }
                  />
                  {errors.feeders?.[idx]?.feederAmps && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.feederAmps?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feeders.${idx}.connectToIncomer`}>
                    Connect to Incomer <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.connectToIncomer}
                    onValueChange={(val) =>
                      onChangeFeeder(idx, "connectToIncomer", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select incomer" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomers.map((inc) => (
                        <SelectItem key={inc.name} value={inc.name}>
                          {inc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeders?.[idx]?.connectToIncomer && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.connectToIncomer?.message}
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
