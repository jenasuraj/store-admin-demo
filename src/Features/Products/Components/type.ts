export interface PaginatedResponse<T> {
  content: T[];
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
}

export interface Product {
  productId: number;
  tags: string | null;
  defaultSku: string;
  name: string;
  subheading: string | null;
  description: string | null;
  groupCompanyId: number;
  companyId: number;
  locationId: number;
  branchId: number;
  createdDate: string | null;
  productTypeId: number;
  status: string;
  attributes: Attribute[];
}

export type Attribute = {
  imgs?: Image[]; // Made optional as it wasn't in your JSON snippet, but good to keep if needed
  title?: string;
  width?: number;
  height?: number;
  size?: string;
  color?: string;
  price: number;
  sku: string;
  variation_id?: number;
  quantity: number;
  fit?: string;
  pattern?: string;
};

export type Image = {
  img_Id: number;
  img_url: string;
  img_name: string;
  img_type: string;
};

type Pageable = {
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