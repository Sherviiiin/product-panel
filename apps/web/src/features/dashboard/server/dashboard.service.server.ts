import type {
  SellerDashboardProductsInput, UserDashboardProductsInput, UpdateSellerListingInput,
  CreateSellerListingInput, CreateSellerProductInput,
  UpdateSellerDashboardProfileInput, UpdateUserDashboardProfileInput,
} from "../dashboard.schema";

import type { UserProductsRepository } from "./repositories/user-products.repository.server"
import type { SellerProductsRepository } from "./repositories/seller-products.repository.server"
import type { DashboardProfileRepository } from "./repositories/dashboard-profile.repository.server"

export class DashboardService {
  constructor(
    private readonly userProductsRepo: UserProductsRepository,
    private readonly sellerProductsRepo: SellerProductsRepository,
    private readonly profileRepo: DashboardProfileRepository,
  ) {}

  async getUserProducts(userId: number, input: UserDashboardProductsInput) {
    return this.userProductsRepo.getUserProducts(userId, input);
  }

  async getSellerProducts(userId: number, input: SellerDashboardProductsInput) {
    return this.sellerProductsRepo.getSellerProducts(userId, input);
  }

  async updateSellerListing(userId: number, input: UpdateSellerListingInput) {
    return this.sellerProductsRepo.updateSellerListing(userId, input);
  }

  async deleteSellerListing(userId: number, listingId: number) {
    return this.sellerProductsRepo.deleteSellerListing(userId, listingId);
  }

  async searchProductsForSeller(userId: number, search: string) {
    return this.sellerProductsRepo.searchProductsForSeller(userId, search);
  }

  async createSellerListing(userId: number, input: CreateSellerListingInput) {
    return this.sellerProductsRepo.createSellerListing(userId, input);
  }

  async createSellerProduct(userId: number, input: CreateSellerProductInput) {
    return this.sellerProductsRepo.createSellerProduct(userId, input);
  }

  async getProductCategories() {
    return this.sellerProductsRepo.getProductCategories();
  }

  getProfile(userId: number) {
    return this.profileRepo.getProfile(userId);
  }
  updateUserProfile(userId: number, input: UpdateUserDashboardProfileInput) {
    return this.profileRepo.updateUserProfile(userId, input);
  }
  updateSellerProfile(userId: number, input: UpdateSellerDashboardProfileInput) {
    return this.profileRepo.updateSellerProfile(userId, input);
  }
}
