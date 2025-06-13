import { Column } from "react-table";
import { ProductType } from "./types";

export const Columns: Column<ProductType>[] = [
  { Header: "Product Type ", accessor: "productTypeName" },
  { Header: "Key Name", accessor: "keyAttributeName" },
];
