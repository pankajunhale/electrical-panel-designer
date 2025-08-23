"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { clientsSchema, ClientsFormData } from "@/schema/ga/clients";
import { useEffect } from "react";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useTransition, useActionState } from "react";
import { submitClients } from "@/actions/ga/clients";

interface ClientsFormProps {
  onNext?: (data: ClientsFormData) => void;
  onBack?: () => void;
  initialData?: ClientsFormData;
  isLoading?: boolean;
}

export function ClientsForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
}: ClientsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitClients, {
    errors: {},
    message: "",
    success: false,
    data: undefined,
  });

  const form = useForm<ClientsFormData>({
    resolver: zodResolver(clientsSchema),
    defaultValues: initialData || {
      name: "",
      address: "",
      contactEmail: "",
      contactNumber: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("ClientsForm initialData:", initialData);
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
          console.log("Form submitted with data:", data);
          startTransition(() => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
              }
            });
            console.log("FormData created:", formData);
            formAction(formData);
          });
        })}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Client Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter client name"
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
            name="contactEmail"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter contact email"
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
            name="contactNumber"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact number"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter client address"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
