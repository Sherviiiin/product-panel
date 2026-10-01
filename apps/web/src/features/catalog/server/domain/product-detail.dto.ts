export interface ProductDetail {
  id: number
  name: string
  description: string | null

  likesCount: number
  viewsCount: number
  savesCount: number

  specs: {
    key: string
    value: string
  }[]
  categories: {
    id: number
    name: string
  }[]

  sellers: {
    id: number
    shopName: string
    price: number
    discountPrice: number | null
    stock: number
    url: string
  }[]

  isLiked: boolean
  isSaved: boolean
}