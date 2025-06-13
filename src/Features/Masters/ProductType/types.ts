export interface ProductTypeList {
  productType: ProductType[] | null;
  loading: boolean;
  error: boolean;
}

export interface ProductType {
  id: string;
  productType: string;
  groupCompanyId: string;
  companyId: string;
  categoryMappingId: string;
  categoryName: string;
}
