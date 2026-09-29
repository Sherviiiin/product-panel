import type { ProductRepository } from "../domain/product.repository"

export class ToggleProductLike {
  constructor(private readonly repository: ProductRepository) {}

  execute(productId: number, userId: number) {

    return this.repository.toggleLike(productId, userId)
  }
}