export type Orders = {
  content: Order[];
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

export type Order = {
  id: number;
  firstName: string;
  lastName: string;
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
  items: OrderItem[];
};

type OrderItem = {
  productId: number;
  productName: string;
  productSubheading: string;
  productDescription: string;
  sku: string;
  images: string[];
  color: string;
  price: number;
  size:string;
  fit:string;
  quantity: number;
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
