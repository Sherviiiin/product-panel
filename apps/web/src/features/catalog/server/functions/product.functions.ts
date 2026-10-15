import { createServerFn } from "@tanstack/react-start";
import { DrizzleProductRepository } from "../infrastructure/product.repository.server";
import { getProductSchema, productsListSchema } from "../../catalog.schema";

import { GetProduct } from "../application/get-product";
import { SearchProducts } from "../application/search-products";
import { ToggleProductLike } from "../application/toggle-product-like";
import { ToggleProductSave } from "../application/toggle-product-save";
import { RecordProductView } from "../application/record-product-view";

import { useAuthSession } from "@/features/auth/server/auth.session.server";

import { getOrCreateGuestId } from "../guest-viewer.server"

// Dipendency Injections
const repository = new DrizzleProductRepository();

const getProductUseCase = new GetProduct(repository);
const searchProductsUseCase = new SearchProducts(repository);
const toggleProductLikeUseCase = new ToggleProductLike(repository);
const toggleProductSaveUseCase = new ToggleProductSave(repository);
const recordProductViewUseCase = new RecordProductView(repository);

// 1- getProduct
export const getProduct = createServerFn({ method: "GET" })
  .validator(getProductSchema)
  .handler(async ({ data }) => {
    //return getProductUseCase.execute(data.id)

    const session = await useAuthSession();

    return getProductUseCase.execute(data.id, session.data.userId);
  });

// 2- searchProducts
export const searchProducts = createServerFn({ method: "GET" })
  .validator(productsListSchema)
  .handler(async ({ data }) => {
    return searchProductsUseCase.execute(data);
  });

// 3- toggleProductLike
export const toggleProductLike = createServerFn({ method: "POST" })
  .validator(getProductSchema)
  .handler(async ({ data }) => {
    const session = await useAuthSession();

    const userId = session.data.userId;

    if (!userId) {
      throw new Error("AUTH_REQUIRED");
    }

    return toggleProductLikeUseCase.execute(data.id, userId);
  });

// 4- toggleProductSave
export const toggleProductSave = createServerFn({ method: "POST" })
  .validator(getProductSchema)
  .handler(async ({ data }) => {
    const session = await useAuthSession();

    const userId = session.data.userId;

    if (!userId) {
      throw new Error("AUTH_REQUIRED");
    }

    return toggleProductSaveUseCase.execute(data.id, userId);
  });

// 5- recordProductView
export const recordProductView = createServerFn({
  method: "POST",
})
  .validator(getProductSchema)
  .handler(async ({ data }) => {
    const session = await useAuthSession()

    return recordProductViewUseCase.execute(data.id, {
      guestId: getOrCreateGuestId(),
      userId: session.data.userId ?? null,
    })
  })
