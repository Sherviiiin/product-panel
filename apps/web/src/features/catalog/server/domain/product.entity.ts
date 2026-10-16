export interface ProductEntity {
  id: number;
  name: string;
  description: string | null;

  likesCount: number;
  viewsCount: number;
  savesCount: number;
}
