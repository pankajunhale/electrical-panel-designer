export interface SLConfigDto {
  id?: number;
  panelId: number;
  configJson?: string | null;
  generatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
