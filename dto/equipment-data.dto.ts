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
  // Physical dimensions for equipment layout
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
