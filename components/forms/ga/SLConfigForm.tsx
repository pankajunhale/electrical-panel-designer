"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slConfigSchema, SlConfigFormData } from "@/schema/ga/sl-config";
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
import { submitSlConfig } from "@/actions/ga/sl-config";

interface SLConfigFormProps {
  onNext?: (data: SlConfigFormData) => void;
  onBack?: () => void;
  initialData?: SlConfigFormData;
  isLoading?: boolean;
  panels?: Array<{ id: number; name: string }>;
}

export function SLConfigForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
  panels = [],
}: SLConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitSlConfig, {
    errors: {},
    message: "",
  });

  const form = useForm<SlConfigFormData>({
    resolver: zodResolver(slConfigSchema),
    defaultValues: initialData || {
      panel_id: undefined,
      config_json: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("SLConfigForm initialData:", initialData);
  }, [initialData]);

  // Handle successful submission
  useEffect(() => {
    if (state.data && Object.keys(state.errors).length === 0) {
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
            name="panel_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Panel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a panel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {panels.map((panel) => (
                      <SelectItem key={panel.id} value={panel.id.toString()}>
                        {panel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config_json"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Configuration JSON</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter single line diagram configuration as JSON"
                    className="min-h-[200px] font-mono text-sm"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-gray-500">
                  Enter the single line diagram configuration in JSON format.
                  This will be used to generate the diagram layout.
                </p>
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
