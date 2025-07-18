"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useEffect, useMemo } from "react";

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
  const [isPending, startTransition] = useTransition();
  // Initialize arrays with proper default values
  const initialIncomers = useMemo(
    () =>
      Array.from({ length: numberOfIncomers }, (_, i) => ({
        name: `Incomer No. ${i + 1}`,
        ampereRating: initialData?.incomers?.[i]?.ampereRating ?? 100,
      })),
    [numberOfIncomers, initialData]
  );
  const initialFeeders = useMemo(
    () =>
      Array.from({ length: numberOfFeeders }, (_, i) => ({
        name: `Feeder No. ${i + 1}`,
        starterType: initialData?.feeders?.[i]?.starterType || STARTER_TYPES[0],
        feederAmps: initialData?.feeders?.[i]?.feederAmps ?? 0.01,
        connectToIncomer:
          initialData?.feeders?.[i]?.connectToIncomer ||
          initialIncomers[0]?.name ||
          `Incomer No. 1`,
      })),
    [numberOfFeeders, initialData, initialIncomers]
  );
  const form = useForm<IncomerDetailsFormData>({
    resolver: zodResolver(incomerDetailsSchema),
    defaultValues: { incomers: initialIncomers, feeders: initialFeeders },
    mode: "onChange",
  });

  // Update arrays when props change
  useEffect(() => {
    form.reset({ incomers: initialIncomers, feeders: initialFeeders });
  }, [initialIncomers, initialFeeders, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(() => onNext(data));
        })}
        className="space-y-8"
      >
        {/* Incomer Details Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Incomer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.watch("incomers").map((incomer, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-center font-semibold rounded-t">
                    {incomer.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.name`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Incomer Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.ampereRating`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Ampere Rating <span className="text-red-500">*</span>
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
        {/* Feeder Details Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Feeder Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.watch("feeders").map((item, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-center font-semibold rounded-t">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.name`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Feeder Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.starterType`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Starter Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.feederAmps`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Feeder Amps <span className="text-red-500">*</span>
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
                    name={`feeders.${idx}.connectToIncomer`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Connect to Incomer{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
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
