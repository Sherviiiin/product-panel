import type { ProductSearchParams, ProductRepository } from "../domain/product.repository"

export interface ProductSearchItem {
  id: number
  name: string
  description: string | null

  categories: {
    id: number
    name: string
  }[]
  
  likesCount: number
  viewsCount: number
  savesCount: number
  minPrice: number | null
  sellerCount: number
}

export class SearchProducts {

  constructor(private productRepository: ProductRepository) {}

  async execute(params: ProductSearchParams) {
    return this.productRepository.searchProducts(params)
  }
}