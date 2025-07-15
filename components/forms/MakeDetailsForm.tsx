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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { makeDetailsSchema, MakeDetailsFormData } from "@/schema/make-details";

const SFU_OPTIONS = ["Siemens_3KL", "L&T", "ABB"];
const MCCB_OPTIONS = ["Siemens_3VT", "L&T", "ABB"];
const ACB_OPTIONS = ["Siemens_3WT_3WL", "L&T", "ABB"];
const MPCB_OPTIONS = ["Siemens_3RV", "L&T", "ABB"];
const CONTACTOR_OPTIONS = ["Siemens_3RT", "L&T", "ABB"];
const METER_OPTIONS = ["Conzerv", "Teknik", "EPCOS"];
const PILOT_DEVICE_OPTIONS = ["Teknik", "Conzerv", "EPCOS"];
const CAPACITOR_OPTIONS = ["EPCOS", "Conzerv", "Teknik"];

export function MakeDetailsForm({
  onSubmit,
}: {
  onSubmit?: (data: MakeDetailsFormData) => void;
}) {
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction] = useActionState(async (prev: any, data: any) => {
    if (onSubmit) onSubmit(data);
    return data;
  }, null);
  const form = useForm<MakeDetailsFormData>({
    resolver: zodResolver(makeDetailsSchema),
    defaultValues: {
      sfu: SFU_OPTIONS[0],
      mccb: MCCB_OPTIONS[0],
      acb: ACB_OPTIONS[0],
      mpcb: MPCB_OPTIONS[0],
      contactor: CONTACTOR_OPTIONS[0],
      meter: METER_OPTIONS[0],
      pilotDevice: PILOT_DEVICE_OPTIONS[0],
      capacitor: CAPACITOR_OPTIONS[0],
    },
    mode: "onChange",
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          startTransition(() => formAction(data))
        )}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sfu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SFUs</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select SFU" />
                    </SelectTrigger>
                    <SelectContent>
                      {SFU_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
            name="mccb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MCCBs</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select MCCB" />
                    </SelectTrigger>
                    <SelectContent>
                      {MCCB_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
            name="acb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ACBs</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ACB" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACB_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
            name="mpcb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MPCBs</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select MPCB" />
                    </SelectTrigger>
                    <SelectContent>
                      {MPCB_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
            name="contactor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contactors</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Contactor" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACTOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
            name="meter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meters</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pilotDevice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilot Devices</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacitor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacitors</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {state.message && (
          <p className="text-green-600 text-sm">{state.message}</p>
        )}
        <Button type="submit" className="mt-4" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="loader spinner-border spinner-border-sm"></span>{" "}
              Saving...
            </span>
          ) : (
            "Next"
          )}
        </Button>
      </form>
    </Form>
  );
}
