export type DiscountResponse = {
  content: Discount[];
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

export interface Discount {
  id: number;
  discountName: string;
  description: string;
  value: number;
  valueType: "PERCENTAGE" | "AMOUNT";
  startDate: string | null;
  endDate: string | null;
  startTime: string;
  endTime: string | null;
  discountOn: "PRODUCT" | "COLLECTION";
  status: boolean;
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
