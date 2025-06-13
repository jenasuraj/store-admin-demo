type Transaction = {
  id: number;
  createdDate: string; // Format: "YYYY-MM-DD"
  createdTime: string; // Format: "HH:mm:ss"
  orderId: string | null;
  sku: string;
  productName: string;
  transactionType: string;
  quantity: number;
  remark: string | null;
};

type SortInfo = {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
};

type Pageable = {
  sort: SortInfo;
  pageNumber: number;
  pageSize: number;
  offset: number;
  unpaged: boolean;
  paged: boolean;
};

export type TransactionResponse = {
  content: Transaction[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  sort: SortInfo;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
};
