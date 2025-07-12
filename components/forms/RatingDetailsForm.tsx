"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
  ratingDetailsSchema,
  RatingDetailsFormData,
} from "@/schema/rating-details";
import { useEffect, useState } from "react";

const CURRENT_RATINGS = [
  "2A",
  "10A",
  "16A",
  "25A",
  "32A",
  "40A",
  "63A",
  "100A",
  "125A",
  "160A",
  "200A",
  "250A",
  "315A",
  "400A",
  "500A",
  "630A",
];
const WIRING_MATERIALS = ["Copper", "Aluminum"];
const CABLES_OR_BUSBARS = ["Cables", "BusBars"];

interface RatingDetailsFormProps {
  onNext: (data: RatingDetailsFormData) => void;
  onBack: () => void;
  initialData?: RatingDetailsFormData;
  isLoading?: boolean;
  numberOfIncomers: number;
  numberOfFeeders: number;
}

export function RatingDetailsForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
  numberOfIncomers,
  numberOfFeeders,
}: RatingDetailsFormProps) {
  const [incomers, setIncomers] = useState(
    Array.from({ length: numberOfIncomers }, (_, i) => ({
      currentRating: initialData?.incomers?.[i]?.currentRating || "100A",
      wiringMaterial: initialData?.incomers?.[i]?.wiringMaterial || "Copper",
      cablesOrBusBars: initialData?.incomers?.[i]?.cablesOrBusBars || "Cables",
    }))
  );
  const [feeders, setFeeders] = useState(
    Array.from({ length: numberOfFeeders }, (_, i) => ({
      currentRating: initialData?.feeders?.[i]?.currentRating || "2A",
      wiringMaterial: initialData?.feeders?.[i]?.wiringMaterial || "Copper",
      cablesOrBusBars: initialData?.feeders?.[i]?.cablesOrBusBars || "Cables",
    }))
  );

  useEffect(() => {
    setIncomers(
      Array.from({ length: numberOfIncomers }, (_, i) => ({
        currentRating: initialData?.incomers?.[i]?.currentRating || "100A",
        wiringMaterial: initialData?.incomers?.[i]?.wiringMaterial || "Copper",
        cablesOrBusBars:
          initialData?.incomers?.[i]?.cablesOrBusBars || "Cables",
      }))
    );
    setFeeders(
      Array.from({ length: numberOfFeeders }, (_, i) => ({
        currentRating: initialData?.feeders?.[i]?.currentRating || "2A",
        wiringMaterial: initialData?.feeders?.[i]?.wiringMaterial || "Copper",
        cablesOrBusBars: initialData?.feeders?.[i]?.cablesOrBusBars || "Cables",
      }))
    );
  }, [numberOfIncomers, numberOfFeeders, initialData]);

  const form = useForm<RatingDetailsFormData>({
    resolver: zodResolver(ratingDetailsSchema),
    defaultValues: { incomers, feeders },
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

  const onChangeIncomer = (idx: number, field: string, value: string) => {
    setIncomers((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };
  const onChangeFeeder = (idx: number, field: string, value: string) => {
    setFeeders((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const onSubmit = (data: RatingDetailsFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Incomer Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Incomer Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomers.map((item, idx) => (
            <Card key={idx} className="bg-muted/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-center bg-muted font-semibold rounded-t">
                  {`Incomer No. ${idx + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Current Rating <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.currentRating}
                    onValueChange={(val) =>
                      onChangeIncomer(idx, "currentRating", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENT_RATINGS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.incomers?.[idx]?.currentRating && (
                    <p className="text-xs text-destructive">
                      {errors.incomers[idx]?.currentRating?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Wiring Material <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.wiringMaterial}
                    onValueChange={(val) =>
                      onChangeIncomer(idx, "wiringMaterial", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {WIRING_MATERIALS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.incomers?.[idx]?.wiringMaterial && (
                    <p className="text-xs text-destructive">
                      {errors.incomers[idx]?.wiringMaterial?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Cables/BusBars <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.cablesOrBusBars}
                    onValueChange={(val) =>
                      onChangeIncomer(idx, "cablesOrBusBars", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {CABLES_OR_BUSBARS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.incomers?.[idx]?.cablesOrBusBars && (
                    <p className="text-xs text-destructive">
                      {errors.incomers[idx]?.cablesOrBusBars?.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Feeder Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Feeder Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeders.map((item, idx) => (
            <Card key={idx} className="bg-muted/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-center bg-muted font-semibold rounded-t">
                  {`Feeder No. ${idx + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Current Rating <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.currentRating}
                    onValueChange={(val) =>
                      onChangeFeeder(idx, "currentRating", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENT_RATINGS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeders?.[idx]?.currentRating && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.currentRating?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Wiring Material <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.wiringMaterial}
                    onValueChange={(val) =>
                      onChangeFeeder(idx, "wiringMaterial", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {WIRING_MATERIALS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeders?.[idx]?.wiringMaterial && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.wiringMaterial?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Cables/BusBars <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={item.cablesOrBusBars}
                    onValueChange={(val) =>
                      onChangeFeeder(idx, "cablesOrBusBars", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {CABLES_OR_BUSBARS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeders?.[idx]?.cablesOrBusBars && (
                    <p className="text-xs text-destructive">
                      {errors.feeders[idx]?.cablesOrBusBars?.message}
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
