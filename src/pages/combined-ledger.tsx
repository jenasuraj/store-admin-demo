import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  Search,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchCustomers } from "@/app/customerSlice";
import ExportLedgerButton from "@/components/ledger/ExportLedgerButton";

// --- Types ---
interface LedgerEntry {
  id: number;
  productId: number;
  productName: string;
  height: number;
  width: number;
  sqFt: number;
  basePrice: number;
  ratePerPiece: number;
  customerName: string;
  quantity: number;
  location: string;
  imageUrl: string | null;
  totalSqft: number | null;
  extraCharge: number;
  amount: number;
  date: string;
}

interface PaymentEntry {
  id: number;
  customerId: number;
  paymentDate: string;
  paymentMode: string;
  description: string;
  amount: number;
  imgUrl: string;
  createdAt: string;
}

interface MonthData {
  month: string;
  entries: LedgerEntry[];
  stats: {
    total: number;
    paid: number;
    pending: number;
    paymentHistory: PaymentEntry[];
  };
}

// --- Components ---

function CustomerCombobox({
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
          className="w-full justify-between bg-white"
        >
          {selectedCustomer
            ? `${selectedCustomer.firstname} ${selectedCustomer.lastname || ""}`
            : "Select Customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search customer..." />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="reset"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-muted-foreground italic border-b"
              >
                <X className="mr-2 h-4 w-4" /> Clear Selection
              </CommandItem>
              {customers.map((customer) => {
                const id = (customer.id || customer.customerId).toString();
                const name = `${customer.firstname} ${customer.lastname || ""}`;
                return (
                  <CommandItem
                    key={id}
                    value={`${name} ${id}`} // Unique searchable value
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
                    {name}
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

export default function LedgerReportPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // In real app: const { customers } = useAppSelector((state) => state.customer);
  const { customers } = useAppSelector((state: any) => state.customer);

  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [reportData, setReportData] = useState<MonthData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleFetchReport = async () => {
    if (!customerId || !startDate || !endDate) return;

    setLoading(true);
    setHasSearched(true);
    try {
      // API Call
      const response = await axios
        .get<MonthData[]>(`${BASE_URL}/api/ledger/ledger-sheet`, {
          params: { customerId, startDate, endDate },
        })
        .catch(() => ({ data: [] })); // Fallback for preview

      // MOCK DATA for Preview if API fails (or returns empty in this env)
      let data = response.data;

      setReportData(data);
    } catch (error) {
      console.error(error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/10 font-sans">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Ledger Report
            </h1>
            <p className="text-muted-foreground text-sm">
              Generate monthly statement statements
            </p>
          </div>
          <ExportLedgerButton />
        </div>

        {/* Input Form */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Report Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Customer <span className="text-red-500">*</span>
                </Label>
                <CustomerCombobox
                  customers={customers}
                  value={customerId}
                  onChange={setCustomerId}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  From Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  To Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleFetchReport}
                disabled={loading || !customerId || !startDate || !endDate}
                className="w-full md:w-auto gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Display */}
        {hasSearched && !loading && reportData && reportData.length > 0 && (
          <div className="space-y-8 bg-white p-8 rounded-lg shadow-sm border min-h-[600px]">
            {/* Report Header */}
            <div className="text-center border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                Statement of Account
              </h2>
              <p className="text-muted-foreground mt-1">
                {reportData[0]?.entries[0]?.customerName || "Customer"}
                <span className="mx-2">•</span>
                {format(new Date(startDate), "dd MMM yyyy")} -{" "}
                {format(new Date(endDate), "dd MMM yyyy")}
              </p>
            </div>

            {reportData.map((monthData, index) => (
              <div key={index} className="space-y-4">
                {/* Month Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase">
                    {monthData.month}
                  </h3>
                </div>

                {/* Ledger Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-[100px] text-xs font-bold text-slate-700">
                          Date
                        </TableHead>
                        <TableHead className="min-w-[200px] text-xs font-bold text-slate-700">
                          Name
                        </TableHead>
                        <TableHead className="min-w-[200px] text-xs font-bold text-slate-700">
                          Location
                        </TableHead>
                        <TableHead className="w-[150px] text-xs font-bold text-slate-700">
                          Product Name
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-xs font-bold text-slate-700">
                          Width
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-xs font-bold text-slate-700">
                          Height
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-xs font-bold text-slate-700">
                          Sq ft
                        </TableHead>
                        <TableHead className="w-[80px] text-right text-xs font-bold text-slate-700">
                          Rate
                        </TableHead>
                        <TableHead className="w-[80px] text-right text-xs font-bold text-slate-700">
                          1 Pc Rate
                        </TableHead>
                        <TableHead className="w-[60px] text-center text-xs font-bold text-slate-700">
                          Qty
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-xs font-bold text-slate-700">
                          Total Sqft
                        </TableHead>
                        <TableHead className="w-[100px] text-center text-xs font-bold text-slate-700">
                          Extra Charges
                        </TableHead>
                        <TableHead className="w-[120px] text-right text-xs font-bold text-slate-700">
                          Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthData.entries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="border-b last:border-0 hover:bg-transparent"
                        >
                          <TableCell className="text-xs">
                            {format(new Date(entry.date), "dd-MMM-yyyy")}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {entry.customerName}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {entry.location}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {entry.productName}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {entry.width}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {entry.height}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {entry.totalSqft || entry.sqFt}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {entry.basePrice}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {entry.ratePerPiece}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {entry.quantity}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {entry.sqFt * entry.quantity}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {entry.extraCharge > 0 ? entry.extraCharge : "-"}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            {entry.amount.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Month Total Row */}
                      <TableRow className="bg-slate-50 font-bold hover:bg-slate-50">
                        <TableCell
                          colSpan={10}
                          className="text-right text-xs uppercase text-slate-600"
                        >
                          Total
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {monthData.stats.total.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Payments Section */}
                {monthData.stats.paymentHistory.length > 0 && (
                  <div className="pl-4 border-l-2 border-green-200 ml-4 space-y-2">
                    {monthData.stats.paymentHistory.map((pay) => (
                      <div
                        key={pay.id}
                        className="flex justify-between items-center text-sm p-2 bg-green-50/50 rounded"
                      >
                        <div className="flex gap-4">
                          <span className="text-slate-500">
                            {format(new Date(pay.paymentDate), "dd-MMM-yyyy")}
                          </span>
                          <span className="font-medium text-slate-700">
                            Payment Received ({pay.paymentMode})
                            {pay.description && (
                              <span className="text-muted-foreground font-normal ml-2">
                                - {pay.description}
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="font-bold text-green-700">
                          {pay.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Month Balance Row (Yellow Highlight) */}
                <div className="flex justify-end mt-2">
                  <div className="bg-yellow-300 px-6 py-2 rounded-md font-bold text-sm min-w-[200px] flex justify-between items-center shadow-sm">
                    <span className="uppercase text-slate-800">Balance</span>
                    <span className="text-slate-900 text-base">
                      {monthData.stats.pending.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Visual Separator if not last */}
                {index < reportData.length - 1 && (
                  <div className="h-8 border-l border-dashed border-slate-300 ml-8 my-4"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {hasSearched &&
          !loading &&
          (!reportData || reportData.length === 0) && (
            <div className="text-center py-20 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">
                No ledger data found for this period.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}
