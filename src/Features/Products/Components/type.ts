export type ProductResponse = {
  content: Product[];
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
  productId: number;
  attributes: Attribute[];
  name: string;
  subheading: string;
  status: "active" | "draft " | "secondary";
};

export interface Product {
  productId: number;
  tags: string | null;
  defaultSku: string;
  name: string;
  subheading: string;
  description: string;
  groupCompanyId: number;
  companyId: number;
  locationId: number;
  branchId: number;
  createdDate: string;
  productType: ProductType;
  productTypeId: string;
  productTypeName: string;
  status: string;
  attributes: Attribute[];
}

export type Attribute = {
  imgs: Image[];
  size: string;
  color: string;
  price: number;
  sku: string;
  variation_id: number;
  quantity: number;
  fit: string;
  pattern: string;
};

export type Image = {
  img_Id: number;
  img_url: string;
  img_name: string;
  img_type: string;
};

type ProductType = {
  id: number;
  productType: string;
  groupCompanyId: number;
  companyId: number;
  categoryMappingId: number;
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
