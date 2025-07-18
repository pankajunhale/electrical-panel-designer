"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
import { useTransition, useActionState } from "react";

const INCOMER_TYPES = ["MCCB", "ACB", "SFU"];
const PHASES = ["1P", "3P"];
const BUS_COUPLER_TYPES = ["MCCB", "ACB", "None"];

interface IncomerTypesFormProps {
  onNext: (data: IncomerTypesFormData) => void;
  onBack: () => void;
  initialData?: IncomerTypesFormData;
  isLoading?: boolean;
  numberOfIncomers: number;
}

export function IncomerTypesForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
  numberOfIncomers,
}: IncomerTypesFormProps) {
  const [isPending, startTransition] = useTransition();
  const [, formAction] = useActionState(
    async (prev: unknown, data: IncomerTypesFormData) => {
      onNext(data);
      return data;
    },
    null
  );
  const incomers = Array.from({ length: numberOfIncomers }, (_, i) => ({
    incomerType: initialData?.incomers?.[i]?.incomerType || "MCCB",
    phase: initialData?.incomers?.[i]?.phase || "3P",
    incomerKA: initialData?.incomers?.[i]?.incomerKA ?? 25,
    metersRequired: initialData?.incomers?.[i]?.metersRequired || {
      amp: false,
      volt: false,
      kwh: false,
      lm: false,
    },
    busCouplerType: initialData?.incomers?.[i]?.busCouplerType || "MCCB",
    alBusBars: initialData?.incomers?.[i]?.alBusBars ?? 150,
    cuCables: initialData?.incomers?.[i]?.cuCables ?? 50,
  }));
  const form = useForm<IncomerTypesFormData>({
    resolver: zodResolver(incomerTypesSchema),
    defaultValues: { incomers },
    mode: "onChange",
  });
  type MeterKey = keyof (typeof incomers)[0]["metersRequired"];
  const onChangeMeter = (idx: number, meter: MeterKey, value: boolean) => {
    const incomersArr = form.getValues("incomers");
    incomersArr[idx].metersRequired[meter] = value;
    form.setValue("incomers", [...incomersArr]);
  };
  const gridCols = Math.min(numberOfIncomers, 4);
  const gridClass = `grid grid-cols-1 sm:grid-cols-${Math.min(
    2,
    gridCols
  )} md:grid-cols-${Math.min(3, gridCols)} lg:grid-cols-${gridCols} gap-4`;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(() => formAction(data));
        })}
        className="space-y-8"
      >
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            Incomer Types
          </h2>
          <div className={gridClass}>
            {form.watch("incomers").map((item, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Incomer {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.incomerType`}
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
                    name={`incomers.${idx}.phase`}
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
                    name={`incomers.${idx}.incomerKA`}
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
                                onChangeMeter(idx, meter as MeterKey, !!val)
                              }
                            />
                            {meter.toUpperCase()}
                          </label>
                        )
                      )}
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.busCouplerType`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Bus Coupler Type{" "}
                          <span className="text-red-500">*</span>
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
                              {BUS_COUPLER_TYPES.map((t) => (
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
                    name={`incomers.${idx}.alBusBars`}
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
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.cuCables`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Cu Cables (sqmm){" "}
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
      </form>
    </Form>
  );
}
