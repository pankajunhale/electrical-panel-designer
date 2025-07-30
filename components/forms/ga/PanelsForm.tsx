"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { panelsSchema, PanelsFormData } from "@/schema/ga/panels";
import { useEffect, useState } from "react";
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
import {
  submitPanels,
  getProjectsForDropdown,
  getLocationsForDropdown,
} from "@/actions/ga/panels";

interface PanelsFormProps {
  onNext?: (data: PanelsFormData) => void;
  onBack?: () => void;
  initialData?: PanelsFormData;
  isLoading?: boolean;
}

export function PanelsForm({
  onNext,
  onBack,
  initialData,
  isLoading = false,
}: PanelsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitPanels, {
    errors: {},
    message: "",
    success: false,
    data: undefined,
  });

  // State for dropdown data
  const [projects, setProjects] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const form = useForm<PanelsFormData>({
    resolver: zodResolver(panelsSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      voltageLevel: "",
      width: "",
      height: "",
      depth: "",
      locationId: "",
      frontViewUrl: "",
      rearViewUrl: "",
      status: "draft",
      projectId: "",
    },
    mode: "onChange",
  });

  // Load dropdown data on component mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoadingDropdowns(true);

        // Load projects
        const projectsResult = await getProjectsForDropdown();
        if (projectsResult.success && projectsResult.data?.projects) {
          setProjects(projectsResult.data.projects);
        }

        // Load locations
        const locationsResult = await getLocationsForDropdown();
        if (locationsResult.success && locationsResult.data) {
          setLocations(locationsResult.data);
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, []);

  useEffect(() => {
    console.log("PanelsForm initialData:", initialData);
  }, [initialData]);

  // Handle successful submission
  useEffect(() => {
    if (state.success && state.data && Object.keys(state.errors).length === 0) {
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
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Panel Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter panel name"
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
            name="projectId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Project <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loadingDropdowns}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingDropdowns
                            ? "Loading projects..."
                            : "Select a project"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
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
            name="voltageLevel"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Voltage Level <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter voltage level"
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
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Width (mm) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter width"
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
            name="height"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Height (mm) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter height"
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
            name="depth"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Depth (mm) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter depth"
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
            name="locationId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Location <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loadingDropdowns}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingDropdowns
                            ? "Loading locations..."
                            : "Select a location"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
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
            name="frontViewUrl"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Front View URL <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter front view URL"
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
            name="rearViewUrl"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Rear View URL <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter rear view URL"
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
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>
                Description <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter panel description"
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
