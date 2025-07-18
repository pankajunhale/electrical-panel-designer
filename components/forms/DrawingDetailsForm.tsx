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
import {
  drawingDetailsSchema,
  type DrawingDetailsFormData,
} from "@/schema/drawing-details";
import { submitDrawingDetails } from "@/actions/drawing-details";
import { useActionState } from "react";
import { useEffect } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitDrawingDetails, {
    errors: {},
    message: "",
  });
  const form = useForm<DrawingDetailsFormData>({
    resolver: zodResolver(drawingDetailsSchema),
    defaultValues: initialData ?? {
      title: "Panel No. 1",
      drawingNo: "DWG/2013/01/REV 1",
      author: "Author Name",
      company: "Your Company Name",
      customer: "Your Customer Name",
      colorFormat: "Colored",
      ferrulPrefix: "1",
      // ...other fields as needed
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
          startTransition(() => formAction(data as unknown as FormData));
        })}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Drawing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="drawingNo"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Drawing No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colorFormat"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Color Format</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Colored">Colored</SelectItem>
                          <SelectItem value="Monochrome">Monochrome</SelectItem>
                        </SelectContent>
                      </FormControl>
                      <FormMessage />
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ferrulPrefix"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Ferrul Prefix (0-9, A-Z)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="loader spinner-border spinner-border-sm"></span>{" "}
                Saving...
              </span>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
