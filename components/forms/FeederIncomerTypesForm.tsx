"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useTransition, useActionState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { submitFeederIncomerTypes } from "@/actions/feeder-incomer-types";

const INCOMER_TYPES = ["MCB", "MCCB", "SFU"];
const PHASES = ["1P", "3P"];

interface FeederIncomerTypesFormProps {
  onNext: (data: FeederIncomerTypesFormData) => void;
  onBack: () => void;
  initialData?: FeederIncomerTypesFormData;
  isLoading?: boolean;
  numberOfFeeders: number;
}

export function FeederIncomerTypesForm({
  onBack,
  initialData,
  isLoading = false,
  numberOfFeeders,
}: FeederIncomerTypesFormProps) {
  const [isPending, startTransition] = useTransition();
  const feeders = Array.from({ length: numberOfFeeders }, (_, i) => ({
    incomerType: initialData?.feeders?.[i]?.incomerType || "MCB",
    phase: initialData?.feeders?.[i]?.phase || "3P",
    incomerKA: initialData?.feeders?.[i]?.incomerKA ?? 25,
    meterRequired: initialData?.feeders?.[i]?.meterRequired || { amp: false },
    alBusBars: initialData?.feeders?.[i]?.alBusBars ?? 25,
  }));
  const form = useForm<FeederIncomerTypesFormData>({
    resolver: zodResolver(feederIncomerTypesSchema),
    defaultValues: { feeders },
    mode: "onChange",
  });
  const gridCols = Math.min(numberOfFeeders, 4);
  const gridClass = `grid grid-cols-1 sm:grid-cols-${Math.min(
    2,
    gridCols
  )} md:grid-cols-${Math.min(3, gridCols)} lg:grid-cols-${gridCols} gap-4`;
  const [, formAction] = useActionState(submitFeederIncomerTypes, {
    errors: {},
    message: "",
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(() => formAction(data as unknown as FormData));
        })}
        className="space-y-8"
      >
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
            {form.watch("feeders").map((item, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-center font-semibold rounded-t">{`Feeder No. ${
                    idx + 1
                  }`}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.incomerType`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Incomer Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.phase`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Phase <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.incomerKA`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Incomer kA <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.meterRequired.amp`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Meter Required</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.alBusBars`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Al Bus Bars (sqmm){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isPending || isLoading}>
            {isPending || isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loader spinner-border spinner-border-sm"></span>{" "}
                Saving...
              </span>
            ) : (
              "Next"
            )}
          </Button>
        </div>
        <pre className="mt-4 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(form.watch("feeders"), null, 2)}
        </pre>
      </form>
    </Form>
  );
}
