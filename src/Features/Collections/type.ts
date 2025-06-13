export interface collectionType {
  id: number;
  name: string;
  description: string;
  products: number[];
  skus: string[];
  createdAt?: string;
}

type Image = {
  img_Id: number;
  img_url: string;
  img_name: string;
  img_type: string;
};

type SkuDetails = {
  sku: string;
  imgs: Image[];
  size: string;
  color: string;
  price: number;
  keyName?: string; // optional because it was empty in your example
  pattern: string;
  quantity: number;
};

type Sku = {
  id: number;
  productId: number;
  productName: string;
  productDescription: string;
  skuDetails: SkuDetails;
};

export type Collection = {
  id: number;
  collectionName: string;
  description: string;
  bannerImage: string | null;
  skus: Sku[];
};
