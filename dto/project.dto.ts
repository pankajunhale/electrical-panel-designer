// Import validation types from schema
import type {
  ProjectCreateInput as SchemaProjectCreateInput,
  ProjectUpdateInput as SchemaProjectUpdateInput,
  ProjectQueryInput as SchemaProjectQueryInput,
  ProjectFiltersInput as SchemaProjectFiltersInput,
  ProjectSortInput as SchemaProjectSortInput,
} from "../schema/ga/project.schema";

// Base Project interface
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId?: string | null;
  userId?: string | null;
  teamId?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  version: number;
}

// Project with relations
export interface ProjectWithRelations extends Project {
  client?: {
    id: string;
    name: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  team?: {
    id: string;
    name: string;
  } | null;
  panels?: {
    id: string;
    name: string;
    status: string;
    createdAt?: Date;
  }[];
  createdByUser?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  updatedByUser?: {
    id: string;
    name: string;
    email?: string;
  } | null;
}

// Project with computed stats
export interface ProjectWithStats extends ProjectWithRelations {
  panelCount: number;
  panelStats: {
    draft: number;
    inProgress: number;
    completed: number;
  };
}

// Project list response
export interface ProjectListResponse {
  projects: ProjectWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Project statistics
export interface ProjectStatistics {
  totalProjects: number;
  totalPanels: number;
  panelsByStatus: Record<string, number>;
  recentProjectsCount: number;
  topClientsCount: number;
  averagePanelsPerProject: number;
}

// Re-export validation types from schema
export type ProjectCreateInput = SchemaProjectCreateInput;
export type ProjectUpdateInput = SchemaProjectUpdateInput;
export type ProjectQueryInput = SchemaProjectQueryInput;
export type ProjectFiltersInput = SchemaProjectFiltersInput;
export type ProjectSortInput = SchemaProjectSortInput;

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string;
}

export type ProjectServiceResponse = ServiceResponse<ProjectWithRelations>;
export type ProjectListServiceResponse = ServiceResponse<ProjectListResponse>;
export type ProjectStatsServiceResponse = ServiceResponse<ProjectStatistics>;

// Panel status enum
export enum PanelStatus {
  DRAFT = "draft",
  IN_PROGRESS = "in_progress",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  COMPLETED = "completed",
  ON_HOLD = "on_hold",
  CANCELLED = "cancelled",
}

// Project filters interface (legacy - use ProjectFiltersInput instead)
export interface ProjectFilters {
  teamId?: string;
  userId?: string;
  clientId?: string;
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasActivePanels?: boolean;
}

// Project sort options
export enum ProjectSortBy {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  CLIENT_NAME = "clientName",
  PANEL_COUNT = "panelCount",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export interface ProjectSortOptions {
  sortBy: ProjectSortBy;
  sortOrder: SortOrder;
}

// Form validation error types
export interface ProjectFormErrors {
  name?: string[];
  description?: string[];
  clientId?: string[];
  userId?: string[];
  teamId?: string[];
  general?: string[];
}
