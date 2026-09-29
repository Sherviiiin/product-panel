export interface ProductSearchItem {
  id: number
  name: string
  description: string | null

  likesCount: number
  viewsCount: number
  savesCount: number

  minPrice: number | null
  sellerCount: number
}