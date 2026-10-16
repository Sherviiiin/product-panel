import type { ProductRepository } from "../domain/product.repository";
import type { ProductDetail } from "../domain/product-detail.dto";

export class GetProduct {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: number, userId?: number): Promise<ProductDetail | null> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      return null;
    }

    const [specs, categories, sellers, interaction] = await Promise.all([
      this.productRepository.findSpecsByProductId(id),

      this.productRepository.findCategoriesByProductId(id),

      this.productRepository.findSellersByProductId(id),

      userId
        ? this.productRepository.getInteractionState(id, userId)
        : Promise.resolve({
            isLiked: false,
            isSaved: false,
          }),
    ]);

    return {
      ...product,
      specs,
      categories,
      sellers,
      ...interaction,
    };
  }
}
