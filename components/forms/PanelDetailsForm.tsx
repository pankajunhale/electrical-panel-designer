"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  panelDetailsSchema,
  PanelDetailsFormData,
} from "@/schema/panel-details";
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
  const [isPending, startTransition] = useTransition();
  const [formAction] = useActionState(
    async (prevState: unknown, formData: PanelDetailsFormData) => {
      // You can call your server action here
      // For demo, just call onNext
      onNext(formData);
      return formData;
    },
    null
  );

  const form = useForm<PanelDetailsFormData>({
    resolver: zodResolver(panelDetailsSchema),
    defaultValues: initialData || {
      maxHeightFeedersSection: 1700,
      panelDoorsThickness: 2,
      mountingPlatesThickness1: 2,
      mountingPlatesThickness2: 2,
      verticalHorizPartitionsThickness: 2,
      horizontalPartitionRequired: false,
      verticalPartitionRequired: false,
      horizontalPartitionsDepth: 300,
      verticalPartitionsDepth: 400,
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("PanelDetailsForm initialData:", initialData);
  }, [initialData]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(() => formAction(data));
        })}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxHeightFeedersSection"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Maximum Height of Feeders Section (700mm to 2500mm)
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-yellow-100"
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
            name="panelDoorsThickness"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Panel Doors Thickness (mm){" "}
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
            name="mountingPlatesThickness1"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Mounting Plates Thickness (mm){" "}
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
            name="mountingPlatesThickness2"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Mounting Plates Thickness (mm){" "}
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
            name="verticalHorizPartitionsThickness"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Vertical & Horiz. Partitions Thickness (mm){" "}
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
            name="horizontalPartitionRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Horizontal Partition Required</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horizontalPartitionsDepth"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Horizontal Partitions Depth (mm){" "}
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
            name="verticalPartitionRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Vertical Partition Required</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verticalPartitionsDepth"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Vertical Partitions Depth (mm){" "}
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
          {JSON.stringify(form.watch(), null, 2)}
        </pre>
      </form>
    </Form>
  );
}
