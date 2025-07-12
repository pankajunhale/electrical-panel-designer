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
import { type DrawingDetailsFormData } from "@/schema/drawing-details";
import { submitDrawingDetails } from "@/actions/drawing-details";
import { useActionState } from "react";
import { useEffect } from "react";

interface DrawingDetailsFormProps {
  onNext: (data: DrawingDetailsFormData) => void;
  onBack: () => void;
  initialData?: DrawingDetailsFormData;
}

export function DrawingDetailsForm({
  onNext,
  onBack,
  initialData,
}: DrawingDetailsFormProps) {
  const [state, formAction] = useActionState(submitDrawingDetails, {
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
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Drawing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={initialData?.title || "Panel No. 1"}
              />
              {state.errors?.title && (
                <p className="text-sm text-destructive">
                  {state.errors.title[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawingNo">Drawing No.</Label>
              <Input
                id="drawingNo"
                name="drawingNo"
                defaultValue={initialData?.drawingNo || "DWG/2013/01/REV 1"}
              />
              {state.errors?.drawingNo && (
                <p className="text-sm text-destructive">
                  {state.errors.drawingNo[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                defaultValue={initialData?.author || "Author Name"}
              />
              {state.errors?.author && (
                <p className="text-sm text-destructive">
                  {state.errors.author[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                defaultValue={initialData?.company || "Your Company Name"}
              />
              {state.errors?.company && (
                <p className="text-sm text-destructive">
                  {state.errors.company[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                name="customer"
                defaultValue={initialData?.customer || "Your Customer Name"}
              />
              {state.errors?.customer && (
                <p className="text-sm text-destructive">
                  {state.errors.customer[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="colorFormat">Color Format</Label>
              <Select
                name="colorFormat"
                defaultValue={initialData?.colorFormat || "Colored"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Colored">Colored</SelectItem>
                  <SelectItem value="Monochrome">Monochrome</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.colorFormat && (
                <p className="text-sm text-destructive">
                  {state.errors.colorFormat[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ferrulPrefix">Ferrul Prefix (0-9, A-Z)</Label>
              <Input
                id="ferrulPrefix"
                name="ferrulPrefix"
                maxLength={1}
                defaultValue={initialData?.ferrulPrefix || "1"}
              />
              {state.errors?.ferrulPrefix && (
                <p className="text-sm text-destructive">
                  {state.errors.ferrulPrefix[0]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {state.message && (
        <p className="text-green-600 text-sm">{state.message}</p>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
