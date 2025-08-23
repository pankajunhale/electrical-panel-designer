export interface RoleDto {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  version?: number;
}

// Legacy interface for backwards compatibility
export interface Role {
  id?: number;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
