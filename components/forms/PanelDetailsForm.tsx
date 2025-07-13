"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  panelDetailsSchema,
  PanelDetailsFormData,
} from "@/schema/panel-details";
import { useEffect } from "react";

interface PanelDetailsFormProps {
  onNext: (data: PanelDetailsFormData) => void;
  onBack: () => void;
  initialData?: PanelDetailsFormData;
  isLoading?: boolean;
}

export function PanelDetailsForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
}: PanelDetailsFormProps) {
  // If we have initial data, make the form read-only
  const isReadOnly = !!initialData;

  // Auto-submit when form is read-only (has initial data)
  useEffect(() => {
    if (isReadOnly && initialData) {
      // Auto-proceed with the initial data
      onNext(initialData);
    }
  }, [isReadOnly, initialData, onNext]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PanelDetailsFormData>({
    resolver: zodResolver(panelDetailsSchema),
    defaultValues: initialData || {
      maxHeightFeedersSection: 1700,
      panelDoorsThickness: 1.6,
      mountingPlatesThickness1: 2,
      mountingPlatesThickness2: 2,
      verticalHorizPartitionsThickness: 1.6,
      horizontalPartitionRequired: false,
      verticalPartitionRequired: false,
      horizontalPartitionsDepth: 300,
      verticalPartitionsDepth: 400,
    },
  });

  // Convert string input to number for numeric fields
  const handleNumberChange =
    (field: keyof PanelDetailsFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(field, e.target.value === "" ? NaN : Number(e.target.value), {
        shouldValidate: true,
      });
    };

  const onSubmit = (data: PanelDetailsFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Maximum Height of Feeders Section (700mm to 2500mm){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            className="bg-yellow-100"
            {...register("maxHeightFeedersSection", { valueAsNumber: true })}
            onChange={handleNumberChange("maxHeightFeedersSection")}
          />
          {errors.maxHeightFeedersSection && (
            <p className="text-xs text-destructive">
              {errors.maxHeightFeedersSection.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            Panel Doors Thickness (mm) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            {...register("panelDoorsThickness", { valueAsNumber: true })}
            onChange={handleNumberChange("panelDoorsThickness")}
          />
          {errors.panelDoorsThickness && (
            <p className="text-xs text-destructive">
              {errors.panelDoorsThickness.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            Mounting Plates Thickness (mm){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            {...register("mountingPlatesThickness1", { valueAsNumber: true })}
            onChange={handleNumberChange("mountingPlatesThickness1")}
          />
          {errors.mountingPlatesThickness1 && (
            <p className="text-xs text-destructive">
              {errors.mountingPlatesThickness1.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            Mounting Plates Thickness (mm){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            {...register("mountingPlatesThickness2", { valueAsNumber: true })}
            onChange={handleNumberChange("mountingPlatesThickness2")}
          />
          {errors.mountingPlatesThickness2 && (
            <p className="text-xs text-destructive">
              {errors.mountingPlatesThickness2.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            Vertical & Horiz. Partitions Thickness (mm){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            {...register("verticalHorizPartitionsThickness", {
              valueAsNumber: true,
            })}
            onChange={handleNumberChange("verticalHorizPartitionsThickness")}
          />
          {errors.verticalHorizPartitionsThickness && (
            <p className="text-xs text-destructive">
              {errors.verticalHorizPartitionsThickness.message}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox {...register("horizontalPartitionRequired")} />
          <Label>Horizontal Partition Required</Label>
        </div>
        <div className="space-y-2">
          <Label>
            Horizontal Partitions Depth (mm){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            {...register("horizontalPartitionsDepth", { valueAsNumber: true })}
            onChange={handleNumberChange("horizontalPartitionsDepth")}
          />
          {errors.horizontalPartitionsDepth && (
            <p className="text-xs text-destructive">
              {errors.horizontalPartitionsDepth.message}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox {...register("verticalPartitionRequired")} />
          <Label>Vertical Partition Required</Label>
        </div>
        <div className="space-y-2">
          <Label>
            Vertical Partitions Depth (mm){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            {...register("verticalPartitionsDepth", { valueAsNumber: true })}
            onChange={handleNumberChange("verticalPartitionsDepth")}
          />
          {errors.verticalPartitionsDepth && (
            <p className="text-xs text-destructive">
              {errors.verticalPartitionsDepth.message}
            </p>
          )}
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
