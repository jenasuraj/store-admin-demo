export type EXCHANGE_STATUS =
  | "INITIATED"
  | "PICKED_UP"
  | "EXCHANGE_APPROVED"
  | "REFUNDED"
  | "REJECTED"
  | "COMPLETED";

export type Exchanges = {
  content: Exchange[];
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

export type Exchange = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSubheading: string;
  sku: SkuDetails;
  exchangeSku: ExchangeSku;
  quantity: string;
  exchangeReason: string;
  exchangeStatus: EXCHANGE_STATUS;
  remark: string;
  rejectedReason: string;
  userId: string;
  firstName: string;
  orderQuantity: string;
  lastName: string;
  userEmail: string;
  exchangeDate: string;
  exchangeDelivered: string;
  localAddress: string;
  landmark: string;
  district: string;
  state: string;
  city: string;
  country: string;
  pincode: string;
  mobileNumber: string;
};

interface SkuDetails {
  sku: string;
  color: string;
  size: string;
  price: string;
  images: Image[];
}
interface ExchangeSku {
  sku: string;
  color: string;
  size: string;
  price: string;
  images: Image[];
}

interface Image {
  img_Id: number;
  img_url: string;
  img_name: string;
  img_type: string;
}

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
