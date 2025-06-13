import { ColumnDef } from "@tanstack/react-table";
import { TransactionResponse } from "./type";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<TransactionResponse>[] = [
  {
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("productName")}</div>
    ),
  },
  {
    accessorKey: "open_stock",
    header: "Open Stock",
  },
  {
    accessorKey: "createdDate",
    header: "Date",
  },
  {
    accessorKey: "createdTime",
    header: "Time",
  },
  {
    accessorKey: "orderId",
    header: "Order Id",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "sku",
    header: () => <div className="text-right">SKU</div>,
    cell: ({ row }) => <div>{row.getValue("sku")}</div>,
  },

  {
    accessorKey: "transactionType",
    header: () => <div className="text-right">Transaction Type</div>,

    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          "capitalize font-medium",
          row.getValue("transactionType") === "added" &&
            "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
          row.getValue("transactionType") === "returned" &&
            "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
          row.getValue("transactionType") === "sold" &&
            "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          row.getValue("transactionType") === "pending" &&
            "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
          row.getValue("transactionType") === "cancelled" &&
            "border-gray-500/50 bg-gray-500/10 text-gray-600 dark:text-gray-400"
        )}
      >
        {row.getValue("transactionType")}
      </Badge>
    ),
  },
  {
    accessorKey: "final_stock",
    header: "Final Stock",
  },

  {
    accessorKey: "remark",
    header: "Remark",
  },
];
