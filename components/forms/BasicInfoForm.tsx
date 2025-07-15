"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { basicInfoSchema, type BasicInfoFormData } from "@/schema/basic-info";
import { submitBasicInfo } from "@/actions/basic-info";
import { useActionState } from "react";
import { useEffect } from "react";
import { Zap, FileText, Wrench } from "lucide-react";
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
const SFU_OPTIONS = ["Siemens_3KL", "L&T", "ABB"];
const MCCB_OPTIONS = ["Siemens_3WL", "L&T", "ABB"];
const ACB_OPTIONS = ["Siemens_3WL", "L&T", "ABB"];
const MPCB_OPTIONS = ["Siemens_3RV", "L&T", "ABB"];
const CONTACTOR_OPTIONS = ["Siemens_3RT", "L&T", "ABB"];

interface BasicInfoFormProps {
  onNext: (data: BasicInfoFormData) => void;
  onBack: () => void;
  initialData?: BasicInfoFormData;
  isLoading?: boolean;
}

export function BasicInfoForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
}: BasicInfoFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitBasicInfo, {
    errors: {},
    message: "",
  });
  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: initialData ?? {
      supplyLineVoltage: undefined,
      supplySystem: SUPPLY_SYSTEMS[0],
      controlVoltage: undefined,
      panelType: PANEL_TYPES[0],
      numberOfIncomers: undefined,
      numberOfOutgoingFeeders: undefined,
      title: "",
      drawingNo: "",
      author: "",
      company: "",
      customer: "",
      colorFormat: "Colored",
      ferrulPrefix: "",
      sfu: SFU_OPTIONS[0],
      mccb: MCCB_OPTIONS[0],
      acb: ACB_OPTIONS[0],
      mpcb: MPCB_OPTIONS[0],
      contactor: CONTACTOR_OPTIONS[0],
      meter: "",
      pilotDevice: "",
      capacitor: "",
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
        onSubmit={form.handleSubmit((data) => {
          startTransition(() => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
              formData.append(key, value.toString());
            });
            formAction(formData);
          });
        })}
        className="space-y-4"
      >
        {/* System Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              System Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="supplyLineVoltage"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Supply Line Voltage <span className="text-red-500">*</span>
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
              name="supplySystem"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Supply System <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPLY_SYSTEMS.map((sys) => (
                        <SelectItem key={sys} value={sys}>
                          {sys}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="controlVoltage"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Control Voltage <span className="text-red-500">*</span>
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
              name="panelType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Panel Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select panel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PANEL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfIncomers"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Number of Incomers <span className="text-red-500">*</span>
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
              name="numberOfOutgoingFeeders"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Number of Outgoing Feeders{" "}
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
          </CardContent>
        </Card>

        {/* Drawing Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Drawing Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Drawing Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="drawingNo"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Drawing Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Author <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Company <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Customer <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorFormat"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Color Format <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select color format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Colored">Colored</SelectItem>
                      <SelectItem value="Monochrome">Monochrome</SelectItem>
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ferrulPrefix"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Ferrul Prefix <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Make Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Make Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="sfu"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>SFUs</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select SFU" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SFU_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mccb"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>MCCBs</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select MCCB" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MCCB_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acb"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>ACBs</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ACB" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACB_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mpcb"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>MPCBs</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select MPCB" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MPCB_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactor"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Contactors</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Contactor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTACTOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meter"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Meters</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pilotDevice"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Pilot Devices</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacitor"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Capacitors</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Save as Default Checkbox */}
        <div className="flex items-center space-x-2">
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
        </div>

        {/* Success/Error Messages */}
        {state.message && (
          <p className="text-green-600 text-sm">{state.message}</p>
        )}

        {/* Form Actions */}
        <div className="flex justify-between">
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
          {JSON.stringify(form.getValues(), null, 2)}
        </pre>
      </form>
    </Form>
  );
}
