import type { ProductRepository, ViewIdentity } from "../domain/product.repository";

export class RecordProductView {
  constructor(private readonly repository: ProductRepository) {}

  execute(productId: number, viewer: ViewIdentity) {
    return this.repository.recordView(productId, viewer);
  }
}
