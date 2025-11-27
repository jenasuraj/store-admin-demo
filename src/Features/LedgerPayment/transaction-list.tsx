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
} from "@/app/transactionSlice";
import { fetchCustomers } from "@/app/customerSlice";

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

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
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

  const { customers } = useAppSelector((state: any) => state.customer);

  // Local State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Init
  useEffect(() => {
    dispatch(fetchCustomers());
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

  // --- Pagination Handler ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      // Assuming your slice exports a 'setPage' or similar action
      dispatch(setPage(newPage)); 
      dispatch(fetchTransactions());
    }
  };

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

  return (
    <main className="min-h-screen bg-muted/10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Transaction History
              </h1>
              <p className="text-muted-foreground text-sm">
                View all payments received
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-white">
            <Download className="w-4 h-4" /> Export List
          </Button>
        </div>

        {/* Filters Bar */}
        <Card className="border-none shadow-none bg-white">
          <CardContent className="p-4 px-0">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Date Filters */}
              <div className="flex gap-2 items-end w-full md:w-auto">
                <div className="space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    className="h-9"
                    value={filterStartDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    className="h-9"
                    value={filterEndDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Customer Filter */}
              <div className="flex-1 md:max-w-[300px] space-y-1 w-full">
                <Label className="text-xs text-muted-foreground">
                  Customer
                </Label>
                <CustomerFilterCombobox
                  customers={customers}
                  value={filterCustomerId}
                  onChange={(val) => handleFilterChange("customerId", val)}
                />
              </div>

              {/* Reset Button */}
              <div className="flex-none">
                {(filterCustomerId || filterStartDate || filterEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                  >
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                  <TableHead className="w-[120px] text-xs font-bold text-slate-700">
                    Date
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-bold text-slate-700">
                    Customer
                  </TableHead>
                  <TableHead className="w-[200px] text-center text-xs font-bold text-slate-700">
                    Mode
                  </TableHead>
                  <TableHead className="min-w-[300px] text-xs font-bold text-slate-700">
                    Description
                  </TableHead>
                  <TableHead className="text-right w-[120px] text-xs font-bold text-slate-700">
                    Amount
                  </TableHead>
                  <TableHead className="text-center w-[100px] text-xs font-bold text-slate-700">
                    Receipt
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading
                        transactions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <Filter className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                      No transactions found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn: any, index: number) => (
                    <TableRow
                      key={index}
                      className="hover:bg-slate-50 transition-colors border-b last:border-0"
                    >
                      {/* Date */}
                      <TableCell className="font-medium text-sm text-slate-600">
                        {txn.date
                          ? format(new Date(txn.date), "dd MMM yyyy")
                          : "-"}
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="font-semibold text-sm text-foreground">
                        {txn.customerName}
                        <div className="text-[10px] text-muted-foreground font-normal">
                          ID: {txn.customerId}
                        </div>
                      </TableCell>

                      {/* Mode */}
                      <TableCell>
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-1"
                          >
                            {getPaymentIcon(txn.paymentMode)}
                            <span className="capitalize">{txn.paymentMode?.toLowerCase().replace("_", " ")}</span>
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell
                        className="text-sm text-slate-600 truncate max-w-[300px]"
                        title={txn.description}
                      >
                        {txn.description || "-"}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-bold font-mono text-base text-emerald-600">
                        +₹{txn.amount.toLocaleString("en-IN")}
                      </TableCell>

                      {/* Receipt */}
                      <TableCell className="text-center">
                        {txn.imgUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                            onClick={() => setPreviewImage(txn.imgUrl)}
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer with Pagination (Replaces Total Count/Received) */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
             <div className="text-xs text-muted-foreground">
               Showing {transactions.length} items (Total: {totalElements})
             </div>
             <div className="flex items-center gap-2">
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="h-8 w-8 bg-white"
                 onClick={() => handlePageChange(currentPage - 1)}
                 disabled={currentPage === 0 || loading}
               >
                 <ChevronLeft className="h-4 w-4" />
               </Button>
               <span className="text-xs font-medium px-2 min-w-[80px] text-center">
                 Page {currentPage + 1} of {totalPages || 1}
               </span>
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="h-8 w-8 bg-white" 
                 onClick={() => handlePageChange(currentPage + 1)}
                 disabled={currentPage >= totalPages - 1 || loading}
               >
                 <ChevronRight className="h-4 w-4" />
               </Button>
             </div>
          </div>
        </Card>
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