export interface ProjectDto {
  id?: string;
  name: string;
  description?: string | null;
  clientId?: number | null;
  userId?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
