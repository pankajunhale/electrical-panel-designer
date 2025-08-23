export interface IncomerDto {
  id?: string;
  name: string;
  ampereRating?: number | null;
  panelId: string;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  version?: number;
}

export interface CreateIncomerDto {
  name: string;
  ampereRating?: number | null;
  panelId: string;
}

export interface UpdateIncomerDto {
  name?: string;
  ampereRating?: number | null;
  panelId?: string;
}
