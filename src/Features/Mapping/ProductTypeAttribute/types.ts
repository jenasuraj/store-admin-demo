export interface ProductTypeList {
  productType: ProductType[] | null;
  loading: boolean;
  error: boolean;
}

export interface ProductType {
  id: string;
  productTypeId: string;
  productTypeName: string;
  keyAttributeId: string;
  keyAttributeName: string;
  groupCompanyId: string;
}
