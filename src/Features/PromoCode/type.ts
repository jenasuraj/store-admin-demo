export type PromoResponse = {
  content: Promo[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
};

export interface Promo {
  id: string;
  promoName: string;
  description: string;
  valueType: string;
  value: string;
  minimumAmount: string;
  isVisible: boolean;
  startDate: string;
  startTime: string;
  endDate: string | null;
  endTime: string | null;
  status: boolean;
  promoOn: string;
  selectAll: string;
}

export type Pageable = {
  sort: Sort;
  pageNumber: number;
  pageSize: number;
  offset: number;
  unpaged: boolean;
  paged: boolean;
};

type Sort = {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
};

interface Image {
  img_Id: string;
  img_url: string;
  img_name: string;
  img_type: string;
}

export interface SkuDetails {
  sku: string;
  imgs: Image[];
  size: string;
  fit: string;
  color: string;
  price: string;
  keyName: string;
  pattern: string;
  quantity: string;
}

export interface DiscountDetails {
  id: string;
  sku: string;
  productId: string;
  productName: string;
  skuDetails: SkuDetails;
}
