import type { ProductRepository } from "../domain/product.repository";

export class RecordProductView {
  constructor(private readonly repository: ProductRepository) {}

  execute(productId: number, userId?: number) {
    return this.repository.recordView(productId, userId);
  }
}
