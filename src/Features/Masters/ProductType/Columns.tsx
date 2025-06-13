import { Column } from "react-table";
import { ProductType } from "./types";

export const Columns: Column<ProductType>[] = [
  { Header: "Category Name", accessor: "categoryName" },
  { Header: "Product Type", accessor: "productType" },
];
