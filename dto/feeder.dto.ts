export interface FeederDto {
  id?: number;
  panelId: number;
  description?: string | null;
  ratingKw?: number | null;
  ratingHp?: number | null;
  starterTypeId?: number | null;
  feederTypeId?: number | null;
  sourceTypeId?: number | null;
  breakerTypeId?: number | null;
  quantity?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
