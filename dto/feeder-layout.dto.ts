export interface FeederLayoutDto {
  id: string;
  feederId: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  version: number;
}

export interface CreateFeederLayoutDto {
  feederId: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
  createdBy?: string | null;
}

export interface UpdateFeederLayoutDto {
  id: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
  updatedBy?: string | null;
}
