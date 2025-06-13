export type OfferResponse = {
  content: Offer[];
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

export interface Offer {
  id: number;
  name: string;
  buyQuantity: number;
  getQuantity: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  selectAll: boolean;
  status: boolean;
  manuallyDeactivated: boolean;
  applyLevel: "PRODUCT" | "CATEGORY" | "ORDER"; // adjust based on your system's enum
  attributeKey: string;
  attributeValues: string[];
}

interface ProductAttribute {
  fit: string;
  sku: string;
  imgs: Image[];
  size: string;
  color: string;
  price: number;
  title: string;
  fabric: string;
  pattern: string;
  quantity: number;
}

export interface OfferSkuDetail {
  skuId: string;
  productId: number;
  productName: string;
  attribute: ProductAttribute;
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
