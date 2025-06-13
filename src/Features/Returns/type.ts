export type RETURN_STATUS =
  | "INITIATED"
  | "PICKED_UP"
  | "REFUND_INITIATED"
  | "REFUNDED"
  | "REJECTED";

export type Returns = {
  content: Return[];
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

export type Return = {
  rejectedReason: string;
  returnProductId: number;
  productId: number;
  productName: string;
  sku: string;
  returnReason: string;
  returnDate: string;
  returnStatus: RETURN_STATUS;
  userId: number;
  quantity: number;
  orderQuantity: number;
  refundAmount: number;
  processedDate: string | null;
  remark: string | null;
  orderId: number;
  orderStatus: string;
  orderDate: string;
  paymentStatus: string;
  paymentMethod: string;
  orderAmount: number;
  totalItems: number;
  transactionId: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  localAddress: string;
  landmark: string | null;
  district: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  skuDetails: SkuDetails;
  mobileNumber: string;
  items: ReturnItem[];
};

type ReturnItem = {
  returnProductId: number;
  orderId: number;
  productId: number;
  productName: string;
  sku: string;
  skuDetails: SkuDetails;
  price: number;
  orderQuantity: number;
  returnReason: string;
  returnDate: string;
  returnStatus: string;
  userId: number;
  userName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  quantity: number;
  refundAmount: number;
  processedDate: string | null;
  remark: string | null;
  localAddress: string;
  landmark: string;
  district: string;
  state: string;
  city: string;
  country: string;
  pincode: string;
  customerName: string;
};

interface SkuDetails {
  sku: string;
  color: string;
  size: string;
  price: number;
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
