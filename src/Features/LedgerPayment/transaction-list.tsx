import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  X,
  Check,
  ChevronsUpDown,
  Loader2,
  Eye,
  Filter,
  CreditCard,
  Banknote,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchTransactions,
  setTransactionFilters,
  resetTransactionFilters,
  setPage,
  Transaction,
} from "@/app/transactionSlice";
import { fetchCustomers } from "@/app/customerSlice";
import { ColumnDef } from "@tanstack/react-table";
import ShadcnTable from "@/components/shadcnTable/ShadcnTable";
import { DatePicker } from "@/pages/LedgerSheet";

// --- Helper for Payment Mode Icon ---
const getPaymentIcon = (mode: string) => {
  switch (mode) {
    case "CASH":
      return <Banknote className="h-4 w-4 text-green-600" />;
    case "BANK_TRANSFER":
      return <Landmark className="h-4 w-4 text-blue-600" />;
    default:
      return <CreditCard className="h-4 w-4 text-purple-600" />;
  }
};

// --- Helper Component: Customer Filter ---
function CustomerFilterCombobox({
  customers,
  value,
  onChange,
}: {
  customers: any[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedCustomer = customers.find(
    (c) => (c.id || c.customerId).toString() === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-input"
        >
          {selectedCustomer
            ? selectedCustomer.firstname
            : "Filter by Customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search customer..." />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all_customers_reset_value"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-muted-foreground italic border-b"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Selection
              </CommandItem>
              {customers.map((customer) => {
                const id = (customer.id || customer.customerId).toString();
                return (
                  <CommandItem
                    key={id}
                    value={customer.firstname}
                    onSelect={() => {
                      onChange(id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {customer.firstname} {customer.lastname}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


const column: ColumnDef<Transaction>[] = [
  {
    accessorFn: (row) => row.date,
    header: "Date",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return format(date, "MMM dd, yyyy");
    }
  },
  {
    accessorFn: (row) => row.customerName,
    header: "Customer",
    cell: ({ row }) => {
      const name = row.original.customerName;
      const id = row.original.customerId;
      return (
        <div>
          {name}
          <div className="text-xs text-muted-foreground">ID: {id}</div>
        </div>
      );
    }
  },
  {
    accessorFn: (row) => row.paymentMode,
    header: "Mode",
    cell: ({ getValue }) => {
      const mode = getValue() as string;
      return <div className="flex justify-center">
        <Badge
          variant="outline"
          className="font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-1"
        >
          {getPaymentIcon(mode)}
          <span className="capitalize">{mode?.toLowerCase().replace("_", " ")}</span>
        </Badge>
      </div>;
    }
  },
  {
    accessorFn: (row) => row.description,
    header: "Description",
  },
  {
    accessorFn: (row) => row.amount,
    header: "Amount",
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return (
        <div className="text-right font-bold font-mono text-base text-emerald-600">
          +₹{amount.toLocaleString("en-IN")}
        </div>
      );
    }
  },
  {
    accessorFn: (row) => row.discount,
    header: "Discount",
    cell: ({ getValue }) => {
      const discount = getValue() as number | null;
      return (
        <div className="text-right font-bold font-mono text-base text-slate-600">
          ₹{discount ? discount.toLocaleString("en-IN") : "0"}
        </div>
      );
    }
  },
  {
    accessorFn: (row) => row.imgUrl,
    header: "Receipt",
    cell: ({ row }) => {
      const imgUrl = row.original.imgUrl;
      return imgUrl ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
          onClick={() => window.open(imgUrl, "_blank")}
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      ) : (
        <span className="text-slate-300 text-xs">-</span>
      );
    }
  },
]
export default function TransactionHistoryPage() {
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>()
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>()
  const dispatch = useAppDispatch();
  
  // Redux
  const {
    transactions,
    loading,
    filterCustomerId,
    filterStartDate,
    filterEndDate,
    currentPage,
    totalPages,
    totalElements,
  } = useAppSelector((state: any) => state.transaction);
  const [localCustomerId, setLocalCustomerId] = useState(filterCustomerId)

  const { customers } = useAppSelector((state: any) => state.customer);

  // Local State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Init
  useEffect(() => {
    dispatch(fetchCustomers({ search: "" }));
    dispatch(fetchTransactions());
  }, [dispatch]);

  // --- Filters ---

  const handleFilterChange = (
    key: "customerId" | "startDate" | "endDate",
    value: string
  ) => {
    dispatch(setTransactionFilters({ [key]: value }));
    dispatch(fetchTransactions());
  };

  const handleResetFilters = () => {
    dispatch(resetTransactionFilters());
    dispatch(fetchTransactions());
  };

  return (
    <main className="min-h-screen bg-muted/10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <ShadcnTable
          title="Transaction"
          columns={column}
          data={transactions}
          loading={loading}
          error={false}
        >
          <div className="flex gap-4 items-end">

            {/* FROM */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <DatePicker
                date={localStartDate}
                onChange={setLocalStartDate}
                placeholder="Select start date"
              />
            </div>

            {/* TO */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <DatePicker
                date={localEndDate}
                onChange={setLocalEndDate}
                placeholder="Select end date"
              />
            </div>

            {/* CUSTOMER */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Customer</Label>
              <CustomerFilterCombobox
                customers={customers}
                value={localCustomerId}
                onChange={setLocalCustomerId}
              />
            </div>

            {/* APPLY */}
            <div>
              <Button
                className="w-full"
                onClick={() => {
                  dispatch(setTransactionFilters({
                    customerId: localCustomerId,
                    startDate: localStartDate
                      ? format(localStartDate, "yyyy-MM-dd")
                      : "",
                    endDate: localEndDate
                      ? format(localEndDate, "yyyy-MM-dd")
                      : "",
                  }))
                  dispatch(fetchTransactions())
                }}
              >
                Apply
              </Button>
            </div>

            {/* CLEAR */}
            <div>
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:bg-red-50"
                onClick={() => {
                  setLocalStartDate(undefined)
                  setLocalEndDate(undefined)
                  setLocalCustomerId("")
                  dispatch(resetTransactionFilters())
                  dispatch(fetchTransactions())
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

          </div>
        </ShadcnTable>
      </div>

      {/* Image Preview Modal */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-slate-100 rounded-lg min-h-[300px] items-center">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Receipt"
                className="max-w-full max-h-[70vh] object-contain rounded shadow-sm"
              />
            ) : (
              <div className="text-muted-foreground">Image not found</div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewImage(null)}>
              Close
            </Button>
            <Button onClick={() => window.open(previewImage || "", "_blank")}>
              Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}