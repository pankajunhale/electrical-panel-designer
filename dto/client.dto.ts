// Import validation types from schema
import type {
  ClientCreateInput as SchemaClientCreateInput,
  ClientUpdateInput as SchemaClientUpdateInput,
  ClientQueryInput as SchemaClientQueryInput,
  ClientFiltersInput as SchemaClientFiltersInput,
  ClientSortInput as SchemaClientSortInput,
} from "../schema/ga/clients";

// Base Client interface
export interface Client {
  id: string;
  name: string;
  address?: string | null;
  contactEmail?: string | null;
  contactNumber?: string | null;
  userId?: string | null;
  teamId?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  version: number;
}

// Client with relations
export interface ClientWithRelations extends Client {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  team?: {
    id: string;
    name: string;
  } | null;
  projects?: {
    id: string;
    name: string;
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

// Client with computed stats
export interface ClientWithStats extends ClientWithRelations {
  projectCount: number;
  projectStats: {
    active: number;
    completed: number;
    draft: number;
  };
}

// Client list response
export interface ClientListResponse {
  clients: ClientWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Client statistics
export interface ClientStatistics {
  totalClients: number;
  totalProjects: number;
  clientsWithProjects: number;
  averageProjectsPerClient: number;
  topClientsByProjects: Array<{
    id: string;
    name: string;
    projectCount: number;
  }>;
  recentClientsCount: number;
}

// Re-export validation types from schema
export type ClientCreateInput = SchemaClientCreateInput;
export type ClientUpdateInput = SchemaClientUpdateInput;
export type ClientQueryInput = SchemaClientQueryInput;
export type ClientFiltersInput = SchemaClientFiltersInput;
export type ClientSortInput = SchemaClientSortInput;

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string;
}

export type ClientServiceResponse = ServiceResponse<ClientWithRelations>;
export type ClientListServiceResponse = ServiceResponse<ClientListResponse>;
export type ClientStatsServiceResponse = ServiceResponse<ClientStatistics>;

// Client filters interface (legacy - use ClientFiltersInput instead)
export interface ClientFilters {
  teamId?: string;
  userId?: string;
  search?: string;
  hasProjects?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// Client sort options
export enum ClientSortBy {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  PROJECT_COUNT = "projectCount",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export interface ClientSortOptions {
  sortBy: ClientSortBy;
  sortOrder: SortOrder;
}

// Form validation error types
export interface ClientFormErrors {
  name?: string[];
  address?: string[];
  contactEmail?: string[];
  contactNumber?: string[];
  userId?: string[];
  teamId?: string[];
  general?: string[];
}

// Legacy DTO interface for backward compatibility
export interface ClientDto extends Client {}

// Contact information interface
export interface ClientContact {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  preferredContactMethod?: "email" | "phone" | "mail";
}

// Client summary for dropdowns and selections
export interface ClientSummary {
  id: string;
  name: string;
  contactEmail?: string | null;
  projectCount?: number;
}
