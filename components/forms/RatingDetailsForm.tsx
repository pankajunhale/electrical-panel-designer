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
import { useTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
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
import { useEffect } from "react";
import { submitRatingDetails } from "@/actions/rating-details";

const CURRENT_RATINGS = [
  "1A",
  "2A",
  "3A",
  "4A",
  "5A",
  "6A",
  "7A",
  "8A",
  "10A",
  "16A",
  "18A",
  "20A",
  "22A",
  "24A",
  "25A",
  "26A",
  "28A",
  "30A",
  "32A",
  "34A",
  "35A",
  "36A",
  "38A",
  "40A",
  "45A",
  "46A",
  "47A",
  "48A",
  "50A",
  "55A",
  "60A",
  "63A",
  "65A",
  "70A",
  "80A",
  "100A",
  "125A",
  "160A",
  "200A",
  "250A",
  "280A",
  "300A",
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
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitRatingDetails, {
    errors: {},
    message: "",
  });
  const incomers = Array.from({ length: numberOfIncomers }, (_, i) => ({
    currentRating: initialData?.incomers?.[i]?.currentRating || "100A",
    wiringMaterial: initialData?.incomers?.[i]?.wiringMaterial || "Copper",
    cablesOrBusBars: initialData?.incomers?.[i]?.cablesOrBusBars || "Cables",
  }));
  const feeders = Array.from({ length: numberOfFeeders }, (_, i) => ({
    currentRating: initialData?.feeders?.[i]?.currentRating || "2A",
    wiringMaterial: initialData?.feeders?.[i]?.wiringMaterial || "Copper",
    cablesOrBusBars: initialData?.feeders?.[i]?.cablesOrBusBars || "Cables",
  }));
  const form = useForm<RatingDetailsFormData>({
    resolver: zodResolver(ratingDetailsSchema),
    defaultValues: { incomers, feeders },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({ incomers, feeders });
  }, [numberOfIncomers, numberOfFeeders, initialData, form]);

  // Handle successful submission
  useEffect(() => {
    if (state.data && Object.keys(state.errors).length === 0) {
      onNext(state.data);
    }
  }, [state, onNext]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(() => {
            const formData = new FormData();
            formData.append("incomers", JSON.stringify(data.incomers));
            formData.append("feeders", JSON.stringify(data.feeders));
            formAction(formData);
          });
        })}
        className="space-y-8"
      >
        {/* Incomer Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Incomer Ratings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.watch("incomers").map((item, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-center font-semibold rounded-t">{`Incomer No. ${
                    idx + 1
                  }`}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.currentRating`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Current Rating <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.wiringMaterial`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Wiring Material{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`incomers.${idx}.cablesOrBusBars`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Cables/BusBars <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
        {/* Feeder Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Feeder Ratings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    name={`feeders.${idx}.currentRating`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Current Rating <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.wiringMaterial`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Wiring Material{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`feeders.${idx}.cablesOrBusBars`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Cables/BusBars <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
      <pre className="mt-4 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
        {JSON.stringify(form.getValues(), null, 2)}
      </pre>
    </Form>
  );
}
