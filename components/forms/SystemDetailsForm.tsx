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
import { useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  systemDetailsSchema,
  SystemDetailsFormData,
} from "@/schema/system-details";
import { useActionState } from "react";
import { submitSystemDetails } from "@/actions/system-details";

type ActionState = {
  errors: Record<string, string[]>;
  message: string;
  data?: SystemDetailsFormData;
};

const SUPPLY_SYSTEMS = [
  "3 Phase 4 Wire, 50Hz",
  "3 Phase 3 Wire, 50Hz",
  "1 Phase 2 Wire, 50Hz",
];
const PANEL_TYPES = [
  "MCC Panel",
  "PCC Panel",
  "APFC Panel",
  "Distribution Panel",
];
interface SystemDetailsFormProps {
  onNext: (data: SystemDetailsFormData) => void;
  initialData?: SystemDetailsFormData;
  isLoading?: boolean;
}

export function SystemDetailsForm({
  onNext,
  initialData,
  isLoading = false,
}: SystemDetailsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState<ActionState, FormData>(
    submitSystemDetails,
    {
      errors: {},
      message: "",
    }
  );
  const form = useForm<SystemDetailsFormData>({
    resolver: zodResolver(systemDetailsSchema),
    defaultValues: initialData ?? {
      supplyLineVoltage: 415,
      supplySystem: SUPPLY_SYSTEMS[0],
      controlVoltage: 240,
      panelType: PANEL_TYPES[0],
      numberOfIncomers: 2,
      numberOfOutgoingFeeders: 8,
      saveAsDefault: false,
    },
    mode: "onChange",
  });

  // Handle successful submission
  useEffect(() => {
    if (state.data && Object.keys(state.errors).length === 0) {
      onNext(state.data);
    }
  }, [state, onNext]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          startTransition(() => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
              formData.append(key, value.toString());
            });
            formAction(formData);
          })
        )}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplyLineVoltage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supply Line Voltage</FormLabel>
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
            name="supplySystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supply System</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLY_SYSTEMS.map((sys) => (
                        <SelectItem key={sys} value={sys}>
                          {sys}
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
            name="controlVoltage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Control Voltage</FormLabel>
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
            name="panelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Panel Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select panel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PANEL_TYPES.map((type) => (
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
            name="numberOfIncomers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Incomers</FormLabel>
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
            name="numberOfOutgoingFeeders"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. of Outgoing Feeders</FormLabel>
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
        <FormField
          control={form.control}
          name="saveAsDefault"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel htmlFor="saveAsDefault" className="font-medium">
                Save Settings as Default
              </FormLabel>
            </FormItem>
          )}
        />
        {state.message && (
          <p className="text-green-600 text-sm">{state.message}</p>
        )}
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
        <pre className="mt-4 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(form.getValues(), null, 2)}
        </pre>
      </form>
    </Form>
  );
}
