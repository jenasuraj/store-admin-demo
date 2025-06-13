import { Column } from "react-table";
import { Attribute } from "./types";

export const Columns: Column<Attribute>[] = [
  { Header: "Attribute Name", accessor: "attributeName" },
  { Header: "Type", accessor: "attributeType" },
];
