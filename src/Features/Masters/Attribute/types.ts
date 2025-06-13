export interface Attribute {
  id: string;
  attributeName: string;
  attributeType: string;
  values: Value[];
}

export interface Value {
  id: string;
  groupCompanyId: string;
  companyId: string;
  locationId: string;
  branchId: string;
  values: string[] | null;
}

export interface AttributeList {
  attribute: Attribute[] | null;
  loading: boolean;
  error: boolean;
}
