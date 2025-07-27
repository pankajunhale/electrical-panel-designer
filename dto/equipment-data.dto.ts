export interface EquipmentDataDto {
  id?: number;
  panelId: number;
  serialNumber: number;
  description: string;
  ratingKw?: number | null;
  ratingHp?: number | null;
  starterTypeId?: number | null;
  quantity?: number | null;
  totalLoadKw?: number | null;
  equipmentTypeId?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
