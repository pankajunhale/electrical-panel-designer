export interface UserDto {
  id?: number;
  name: string;
  email: string;
  passwordHash: string;
  roleId?: number | null;
  teamId?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
