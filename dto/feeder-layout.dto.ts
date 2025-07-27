export interface FeederLayoutDto {
  id?: number;
  feederId: number;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
