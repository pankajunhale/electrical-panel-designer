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
import { Textarea } from "@/components/ui/textarea";
import { type ProjectFormData, type UpdateProjectData } from "@/schema/project";
import { createProject, updateProject } from "@/actions/projects";
import { useActionState } from "react";
import { useEffect } from "react";
import { Building, Calendar, DollarSign, MapPin } from "lucide-react";
import { ProjectDto } from "@/dto/project.dto";

const STATUS_OPTIONS = ["Active", "Completed", "On Hold", "Cancelled"] as const;
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

interface ProjectsFormProps {
  onSuccess?: (data: ProjectFormData | UpdateProjectData) => void;
  onCancel?: () => void;
  initialData?: ProjectDto;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function ProjectsForm({
  onSuccess,
  onCancel,
  initialData,
  isLoading = false,
  mode = "create",
}: ProjectsFormProps) {
  const [state, formAction] = useActionState(
    mode === "edit" ? updateProject : createProject,
    {
      errors: {},
      message: "",
    }
  );

  // Handle successful submission
  useEffect(() => {
    if (state.data && Object.keys(state.errors).length === 0) {
      onSuccess?.(state.data);
    }
  }, [state, onSuccess]);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden ID field for edit mode */}
      {mode === "edit" && initialData && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      {/* Project Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" />
            Project Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="name">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter project name"
              defaultValue={initialData?.name || ""}
            />
            {state.errors?.name && (
              <p className="text-xs text-destructive">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="client">
              Client <span className="text-red-500">*</span>
            </Label>
            <Input
              id="client"
              name="client"
              placeholder="Enter client name"
              defaultValue={initialData?.client || ""}
            />
            {state.errors?.client && (
              <p className="text-xs text-destructive">
                {state.errors.client[0]}
              </p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter project description (optional)"
              rows={3}
              defaultValue={initialData?.description || ""}
            />
            {state.errors?.description && (
              <p className="text-xs text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                name="location"
                placeholder="Enter project location"
                className="pl-10"
                defaultValue={initialData?.location || ""}
              />
            </div>
            {state.errors?.location && (
              <p className="text-xs text-destructive">
                {state.errors.location[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              name="status"
              defaultValue={initialData?.status || STATUS_OPTIONS[0]}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.status && (
              <p className="text-xs text-destructive">
                {state.errors.status[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="priority">
              Priority <span className="text-red-500">*</span>
            </Label>
            <Select
              name="priority"
              defaultValue={initialData?.priority || PRIORITY_OPTIONS[0]}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.priority && (
              <p className="text-xs text-destructive">
                {state.errors.priority[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline & Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="startDate">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={formatDateForInput(initialData?.startDate)}
            />
            {state.errors?.startDate && (
              <p className="text-xs text-destructive">
                {state.errors.startDate[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={formatDateForInput(initialData?.endDate)}
            />
            {state.errors?.endDate && (
              <p className="text-xs text-destructive">
                {state.errors.endDate[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="budget">Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget"
                name="budget"
                type="number"
                placeholder="0.00"
                className="pl-10"
                step="0.01"
                defaultValue={initialData?.budget || ""}
              />
            </div>
            {state.errors?.budget && (
              <p className="text-xs text-destructive">
                {state.errors.budget[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {state.message && (
        <p
          className={`text-sm ${
            Object.keys(state.errors).length === 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}

      {/* Form Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update Project"
            : "Create Project"}
        </Button>
      </div>
    </form>
  );
}