export interface AttributeList {
  attribute: AttributeValue[] | null;
  loading: boolean;
  error: boolean;
  attributesByProdTypeId: AttributeByProductTypeId[] | null;
  attributesByAttributeId: string[] | null;
}
interface AttributeValue {
  keyAttributeId: string;
  value: string[];
  groupCompanyId: string;
  keyId: string;
  keyName: string;
}

export interface Values {
  id: string;
  productTypeId: string | null;
  groupCompanyId: string;
  companyId: string;
  values: string[];
}

export interface AttributeByProductTypeId {
  id: string;
  productTypeId: string;
  productTypeName: string;
  keyAttributeId: string;
  keyAttributeName: string;
  groupCompanyId: string;
}

export interface ColumnAttributeValues {
  keyAttributeId: string;
  value: string[];
  groupCompanyId: string;
  keyId: string;
  keyName: string;
  keyValues: string;
}
