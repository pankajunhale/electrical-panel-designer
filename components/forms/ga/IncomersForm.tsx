"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { incomersSchema, IncomersFormData } from "@/schema/ga/incomers";
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
import { submitIncomers } from "@/actions/ga/incomers";

interface IncomersFormProps {
  onNext?: (data: IncomersFormData) => void;
  onBack?: () => void;
  initialData?: IncomersFormData;
  isLoading?: boolean;
}

export function IncomersForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
}: IncomersFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitIncomers, {
    errors: {},
    message: "",
    success: false,
    data: undefined,
  });

  const form = useForm<IncomersFormData>({
    resolver: zodResolver(incomersSchema),
    defaultValues: initialData || {
      name: "",
      ampereRating: 0,
      panelId: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("IncomersForm initialData:", initialData);
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
              if (value !== null && value !== undefined) {
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
                  Incomer Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter incomer name"
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
            name="ampereRating"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Ampere Rating <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter ampere rating"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="panelId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Panel ID <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter panel ID"
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
