import { Column } from "react-table";
import { ColumnAttributeValues } from "./types";

export const Columns: Column<ColumnAttributeValues>[] = [
  { Header: "Keyname", accessor: "keyName" },
  {
    Header: "Value",
    accessor: "keyValues",
    Cell: ({ row }) => {
      return (
        <span>
          {row.original.keyName != "color"
            ? row.original.keyValues
            : row.original.value?.map((d) => d?.split(":")[0])?.toString()}
        </span>
      );
    },
  },
];



