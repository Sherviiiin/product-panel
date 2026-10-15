import type {
  SellerDashboardProductsInput, UserDashboardProductsInput, UpdateSellerListingInput,
  CreateSellerListingInput, CreateSellerProductInput,
  UpdateSellerDashboardProfileInput, UpdateUserDashboardProfileInput,
} from "../dashboard.schema";

import { DashboardRepository } from "./dashboard.repository.server";

const repository = new DashboardRepository();

export class DashboardService {
  async getUserProducts(userId: number, input: UserDashboardProductsInput) {
    return repository.getUserProducts(userId, input);
  }

  async getSellerProducts(userId: number, input: SellerDashboardProductsInput) {
    return repository.getSellerProducts(userId, input);
  }

  async updateSellerListing(userId: number, input: UpdateSellerListingInput) {
    return repository.updateSellerListing(userId, input);
  }

  async deleteSellerListing(userId: number, listingId: number) {
    return repository.deleteSellerListing(userId, listingId);
  }

  async searchProductsForSeller(userId: number, search: string) {
    return repository.searchProductsForSeller(userId, search);
  }

  async createSellerListing(userId: number, input: CreateSellerListingInput) {
    return repository.createSellerListing(userId, input);
  }

  async createSellerProduct(userId: number, input: CreateSellerProductInput) {
    return repository.createSellerProduct(userId, input);
  }

  async getProductCategories() {
    return repository.getProductCategories();
  }

  getProfile(userId: number) {
    return repository.getProfile(userId);
  }
  updateUserProfile(userId: number, input: UpdateUserDashboardProfileInput) {
    return repository.updateUserProfile(userId, input);
  }
  updateSellerProfile(userId: number, input: UpdateSellerDashboardProfileInput) {
    return repository.updateSellerProfile(userId, input);
  }
}

export const dashboardService = new DashboardService();
