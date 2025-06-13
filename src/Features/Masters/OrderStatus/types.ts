export interface OrderStatus {
  id: string;
  orderStatus: string;
  statusLevel: string;
}

export interface OrderStatusState {
  entity: OrderStatus[] | null;
  loading: boolean;
  error: boolean;
}
