import { Column } from "react-table";
import { OrderStatus } from "./types";

export const Columns: Column<OrderStatus>[] = [
  { Header: "Order Status", accessor: "orderStatus" },
  { Header: "Status Level", accessor: "statusLevel" },
];
