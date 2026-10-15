import { DashboardService } from "./dashboard.service.server"
import { UserProductsRepository } from "./repositories/user-products.repository.server"
import { SellerProductsRepository } from "./repositories/seller-products.repository.server"
import { DashboardProfileRepository } from "./repositories/dashboard-profile.repository.server"

export const dashboardService = new DashboardService(
  new UserProductsRepository(),
  new SellerProductsRepository(),
  new DashboardProfileRepository(),
)