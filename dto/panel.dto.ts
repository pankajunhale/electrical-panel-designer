export interface PanelDto {
  id?: number;
  projectId: string;
  name: string;
  description?: string | null;
  voltageLevel?: string | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  locationId?: number | null;
  frontViewUrl?: string | null;
  rearViewUrl?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
