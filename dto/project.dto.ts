export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  client: string;
  location: string;
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  startDate: string;
  endDate?: string;
  budget?: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  client: string;
  location: string;
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  startDate: string;
  endDate?: string;
  budget?: number;
  priority: "Low" | "Medium" | "High" | "Critical";
}

export interface UpdateProjectDto {
  id: string;
  name?: string;
  description?: string;
  client?: string;
  location?: string;
  status?: "Active" | "Completed" | "On Hold" | "Cancelled";
  startDate?: string;
  endDate?: string;
  budget?: number;
  priority?: "Low" | "Medium" | "High" | "Critical";
}