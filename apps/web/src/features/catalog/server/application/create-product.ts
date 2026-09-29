//import type { ProductRepository } from "../domain/product.repository"
//import type { ProductEntity } from "../domain/product.entity"
//
//type CreateProductInput = Omit<ProductEntity, "id">
//
//export class CreateProduct {
//
//  constructor(private productRepository: ProductRepository) {}
//
//  async execute(data: CreateProductInput) {
//    return this.productRepository.create(data)
//  }
//
//}