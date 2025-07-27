export interface ClientDto {
  id?: number;
  name: string;
  address?: string | null;
  contactEmail?: string | null;
  contactNumber?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
