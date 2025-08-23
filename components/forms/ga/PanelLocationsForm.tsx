"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  panelLocationsSchema,
  PanelLocationsFormData,
} from "@/schema/ga/panel-locations";
import { useEffect } from "react";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from "react";
import { useActionState } from "react";
import { submitPanelLocations } from "@/actions/ga/panel-locations";

interface PanelLocationsFormProps {
  onNext?: (data: PanelLocationsFormData) => void;
  onBack?: () => void;
  initialData?: PanelLocationsFormData;
  isLoading?: boolean;
}

export function PanelLocationsForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
}: PanelLocationsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitPanelLocations, {
    errors: {},
    message: "",
    success: false,
    data: undefined,
  });

  const form = useForm<PanelLocationsFormData>({
    resolver: zodResolver(panelLocationsSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("PanelLocationsForm initialData:", initialData);
  }, [initialData]);

  // Handle successful submission
  useEffect(() => {
    if (state.success && state.data && Object.keys(state.errors).length === 0) {
      onNext?.(state.data);
    }
  }, [state, onNext]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(() => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
              }
            });
            formAction(formData);
          });
        })}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Location Name<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter panel location name"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter location description"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {state.message && (
          <div
            className={`p-4 rounded-md ${
              Object.keys(state.errors).length === 0
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="flex justify-between">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isPending}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending || isLoading}
            className="ml-auto"
          >
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
