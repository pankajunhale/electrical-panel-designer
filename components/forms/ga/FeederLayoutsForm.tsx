"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  feederLayoutsSchema,
  FeederLayoutsFormData,
} from "@/schema/ga/feeder-layouts";
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
import { submitFeederLayouts } from "@/actions/ga/feeder-layouts";

interface FeederLayoutsFormProps {
  onNext?: (data: FeederLayoutsFormData) => void;
  onBack?: () => void;
  initialData?: FeederLayoutsFormData;
  isLoading?: boolean;
  feeders?: Array<{ id: number; description: string }>;
}

export function FeederLayoutsForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
  feeders = [],
}: FeederLayoutsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitFeederLayouts, {
    errors: {},
    message: "",
  });

  const form = useForm<FeederLayoutsFormData>({
    resolver: zodResolver(feederLayoutsSchema),
    defaultValues: initialData || {
      feeder_id: undefined,
      x: undefined,
      y: undefined,
      width: undefined,
      height: undefined,
      view_type: undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("FeederLayoutsForm initialData:", initialData);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="feeder_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Feeder</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feeder" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {feeders.map((feeder) => (
                      <SelectItem key={feeder.id} value={feeder.id.toString()}>
                        {feeder.description || `Feeder ${feeder.id}`}
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
            name="view_type"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>View Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select view type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="front">Front View</SelectItem>
                    <SelectItem value="rear">Rear View</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="x"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>X Position</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter X position"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
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
            name="y"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Y Position</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter Y position"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
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
            name="width"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter width"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
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
            name="height"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter height"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
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
