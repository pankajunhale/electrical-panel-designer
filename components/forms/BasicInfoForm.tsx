"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { type BasicInfoFormData } from "@/schema/basic-info";
import { submitBasicInfo } from "@/actions/basic-info";
import { useActionState } from "react";
import { useEffect } from "react";
import { Zap, FileText, Wrench } from "lucide-react";

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
const METER_OPTIONS = ["Conzerv", "Teknik", "EPCOS"];
const PILOT_DEVICE_OPTIONS = ["Teknik", "Conzerv", "EPCOS"];
const CAPACITOR_OPTIONS = ["EPCOS", "Conzerv", "Teknik"];

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
  const [state, formAction] = useActionState(submitBasicInfo, {
    errors: {},
    message: "",
  });

  // Handle successful submission
  useEffect(() => {
    if (state.data && Object.keys(state.errors).length === 0) {
      onNext(state.data);
    }
  }, [state, onNext]);

  return (
    <form action={formAction} className="space-y-4">
      {/* System Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            System Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="supplyLineVoltage">
              Supply Line Voltage <span className="text-red-500">*</span>
            </Label>
            <Input
              id="supplyLineVoltage"
              name="supplyLineVoltage"
              defaultValue={initialData?.supplyLineVoltage || "415"}
            />
            {state.errors?.supplyLineVoltage && (
              <p className="text-xs text-destructive">
                {state.errors.supplyLineVoltage[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="supplySystem">
              Supply System <span className="text-red-500">*</span>
            </Label>
            <Select
              name="supplySystem"
              defaultValue={initialData?.supplySystem || SUPPLY_SYSTEMS[0]}
            >
              <SelectTrigger className="w-full">
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
            {state.errors?.supplySystem && (
              <p className="text-xs text-destructive">
                {state.errors.supplySystem[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="controlVoltage">
              Control Voltage <span className="text-red-500">*</span>
            </Label>
            <Input
              id="controlVoltage"
              name="controlVoltage"
              defaultValue={initialData?.controlVoltage || "240"}
            />
            {state.errors?.controlVoltage && (
              <p className="text-xs text-destructive">
                {state.errors.controlVoltage[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="panelType">
              Panel Type <span className="text-red-500">*</span>
            </Label>
            <Select
              name="panelType"
              defaultValue={initialData?.panelType || PANEL_TYPES[0]}
            >
              <SelectTrigger className="w-full">
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
            {state.errors?.panelType && (
              <p className="text-xs text-destructive">
                {state.errors.panelType[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="numberOfIncomers">
              Number of Incomers <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numberOfIncomers"
              name="numberOfIncomers"
              type="number"
              min={1}
              defaultValue={initialData?.numberOfIncomers || "2"}
            />
            {state.errors?.numberOfIncomers && (
              <p className="text-xs text-destructive">
                {state.errors.numberOfIncomers[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="numberOfOutgoingFeeders">
              Number of Outgoing Feeders <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numberOfOutgoingFeeders"
              name="numberOfOutgoingFeeders"
              type="number"
              min={1}
              defaultValue={initialData?.numberOfOutgoingFeeders || "8"}
            />
            {state.errors?.numberOfOutgoingFeeders && (
              <p className="text-xs text-destructive">
                {state.errors.numberOfOutgoingFeeders[0]}
              </p>
            )}
          </div>
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
          <div className="space-y-1">
            <Label htmlFor="title">
              Drawing Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData?.title || "Panel No. 1"}
            />
            {state.errors?.title && (
              <p className="text-xs text-destructive">
                {state.errors.title[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="drawingNo">
              Drawing Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="drawingNo"
              name="drawingNo"
              defaultValue={initialData?.drawingNo || "DWG/2013/01/REV 1"}
            />
            {state.errors?.drawingNo && (
              <p className="text-xs text-destructive">
                {state.errors.drawingNo[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="author">
              Author <span className="text-red-500">*</span>
            </Label>
            <Input
              id="author"
              name="author"
              defaultValue={initialData?.author || "Author Name"}
            />
            {state.errors?.author && (
              <p className="text-xs text-destructive">
                {state.errors.author[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="company">
              Company <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              name="company"
              defaultValue={initialData?.company || "Your Company Name"}
            />
            {state.errors?.company && (
              <p className="text-xs text-destructive">
                {state.errors.company[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="customer">
              Customer <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer"
              name="customer"
              defaultValue={initialData?.customer || "Your Customer Name"}
            />
            {state.errors?.customer && (
              <p className="text-xs text-destructive">
                {state.errors.customer[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="colorFormat">
              Color Format <span className="text-red-500">*</span>
            </Label>
            <Select
              name="colorFormat"
              defaultValue={initialData?.colorFormat || "Colored"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select color format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Colored">Colored</SelectItem>
                <SelectItem value="Monochrome">Monochrome</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.colorFormat && (
              <p className="text-xs text-destructive">
                {state.errors.colorFormat[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="ferrulPrefix">
              Ferrul Prefix <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ferrulPrefix"
              name="ferrulPrefix"
              defaultValue={initialData?.ferrulPrefix || "1"}
            />
            {state.errors?.ferrulPrefix && (
              <p className="text-xs text-destructive">
                {state.errors.ferrulPrefix[0]}
              </p>
            )}
          </div>
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
          <div className="space-y-1">
            <Label htmlFor="sfu">SFUs</Label>
            <Select
              name="sfu"
              defaultValue={initialData?.sfu || SFU_OPTIONS[0]}
            >
              <SelectTrigger className="w-full">
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
            {state.errors?.sfu && (
              <p className="text-xs text-destructive">{state.errors.sfu[0]}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="mccb">MCCBs</Label>
            <Select
              name="mccb"
              defaultValue={initialData?.mccb || MCCB_OPTIONS[0]}
            >
              <SelectTrigger className="w-full">
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
            {state.errors?.mccb && (
              <p className="text-xs text-destructive">{state.errors.mccb[0]}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="acb">ACBs</Label>
            <Select
              name="acb"
              defaultValue={initialData?.acb || ACB_OPTIONS[0]}
            >
              <SelectTrigger className="w-full">
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
            {state.errors?.acb && (
              <p className="text-xs text-destructive">{state.errors.acb[0]}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="mpcb">MPCBs</Label>
            <Select
              name="mpcb"
              defaultValue={initialData?.mpcb || MPCB_OPTIONS[0]}
            >
              <SelectTrigger className="w-full">
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
            {state.errors?.mpcb && (
              <p className="text-xs text-destructive">{state.errors.mpcb[0]}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="contactor">Contactors</Label>
            <Select
              name="contactor"
              defaultValue={initialData?.contactor || CONTACTOR_OPTIONS[0]}
            >
              <SelectTrigger className="w-full">
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
            {state.errors?.contactor && (
              <p className="text-xs text-destructive">
                {state.errors.contactor[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="meter">Meters</Label>
            <Input
              id="meter"
              name="meter"
              defaultValue={initialData?.meter || METER_OPTIONS[0]}
            />
            {state.errors?.meter && (
              <p className="text-xs text-destructive">
                {state.errors.meter[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="pilotDevice">Pilot Devices</Label>
            <Input
              id="pilotDevice"
              name="pilotDevice"
              defaultValue={initialData?.pilotDevice || PILOT_DEVICE_OPTIONS[0]}
            />
            {state.errors?.pilotDevice && (
              <p className="text-xs text-destructive">
                {state.errors.pilotDevice[0]}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="capacitor">Capacitors</Label>
            <Input
              id="capacitor"
              name="capacitor"
              defaultValue={initialData?.capacitor || CAPACITOR_OPTIONS[0]}
            />
            {state.errors?.capacitor && (
              <p className="text-xs text-destructive">
                {state.errors.capacitor[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save as Default Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveAsDefault"
          name="saveAsDefault"
          defaultChecked={initialData?.saveAsDefault || false}
        />
        <Label htmlFor="saveAsDefault" className="font-medium">
          Save Settings as Default
        </Label>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </form>
  );
}
