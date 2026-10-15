import type { ProductEntity } from "./product.entity";

export type ProductSortField = "name" | "likesCount" | "viewsCount" | "savesCount" | "minPrice";
import type { ProductSearchItem } from "../application/search-products";

export interface ProductSearchParams {
  page: number;
  pageSize: number;
  search?: string;
  categoryIds?: number[];

  minPrice?: number;
  maxPrice?: number;

  sortBy?: ProductSortField;
  sortOrder?: "asc" | "desc";
}

export interface ProductSpec {
  id: number;
  key: string;
  value: string;
}
export interface ProductSeller {
  id: number;
  shopName: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  url: string;
}

export interface ProductCategory {
  id: number;
  name: string;
}
export interface ProductRepository {
  findById(id: number): Promise<ProductEntity | null>;

  findSpecsByProductId(productId: number): Promise<ProductSpec[]>;
  findSellersByProductId(productId: number): Promise<ProductSeller[]>;
  findCategoriesByProductId(productId: number): Promise<ProductCategory[]>;

  getInteractionState(
    productId: number,
    userId: number,
  ): Promise<{
    isLiked: boolean;
    isSaved: boolean;
  }>;
  toggleLike(
    productId: number,
    userId: number,
  ): Promise<{
    isLiked: boolean;
    likesCount: number;
  }>;
  toggleSave(
    productId: number,
    userId: number,
  ): Promise<{
    isSaved: boolean;
    savesCount: number;
  }>;
  recordView(
    productId: number,
    userId?: number,
  ): Promise<{
    viewsCount: number;
  }>;

  searchProducts(params: ProductSearchParams): Promise<{
    items: ProductSearchItem[];
    total: number;
  }>;

  //create(data: Omit<ProductEntity, "id">): Promise<ProductEntity>
}
