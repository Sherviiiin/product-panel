import type { ProductRepository } from "../domain/product.repository"

export class ToggleProductSave {
  constructor(private readonly repository: ProductRepository) {}

  execute(productId: number, userId: number) {
    
    return this.repository.toggleSave(productId, userId)
  }
}