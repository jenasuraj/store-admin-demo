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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  Search,
  ArrowLeft,
  X,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchCustomers } from "@/app/customerSlice";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import XLSX from "xlsx-js-style";

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
  discount: number | null;
  isDiscountApplied: null | boolean;
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
                    value={`${name} ${id}`}
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

  const { customers } = useAppSelector((state: any) => state.customer);

  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [reportData, setReportData] = useState<MonthData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers({ search: "" }));
  }, [dispatch]);

  const handleFetchReport = async () => {
    if (!customerId || !startDate || !endDate) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await axios
        .get<MonthData[]>(`${BASE_URL}/api/ledger/ledger-sheet`, {
          params: { customerId, startDate, endDate },
        })
        .catch(() => ({ data: [] }));

      let data = response.data;
      setReportData(data);
    } catch (error) {
      console.error(error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!reportData || reportData.length === 0) return;

    setIsExporting(true);

    const customer = customers.find(
      (c: any) => (c.id || c.customerId).toString() === customerId
    );
    const customerName = customer ? `${customer.firstname}` : "Customer";

    const doc = new jsPDF();

    // Function to add watermark to current page
    const addWatermark = () => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200); // Light grey color
      doc.text("Generated by:", 14, pageHeight - 15);
      doc.text("ActifyBooks", 14, pageHeight - 10);
    };

    doc.setFontSize(18);
    doc.text(`Ledger Statement - ${customerName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Period: ${format(new Date(startDate), "dd MMM yyyy")} to ${format(
        new Date(endDate),
        "dd MMM yyyy"
      )}`,
      14,
      22
    );

    let finalY = 25;

    reportData.forEach((monthData) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(monthData.month, 14, finalY + 10);

      const tableBody = monthData.entries.map((entry) => [
        format(new Date(entry.date), "dd-MMM-yyyy"),
        entry.productName,
        entry.height,
        entry.width,
        entry.sqFt,
        (entry.sqFt * entry.quantity).toFixed(2),
        entry.basePrice,
        entry.ratePerPiece,
        entry.quantity,
        entry.extraCharge,
        entry.amount.toLocaleString("en-IN"),
      ]);

      autoTable(doc, {
        startY: finalY + 15,
        head: [
          [
            "Date",
            "Item Name",
            "H",
            "W",
            "Sq ft",
            "Tot Sqft",
            "Rate",
            "1pc Rate",
            "Qty",
            "Extra",
            "Amount",
          ],
        ],
        body: tableBody,
        theme: "grid",
        styles: { fontSize: 6, cellPadding: 2 },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 25 },
          10: { halign: "right" },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          // Add watermark to each page as it's drawn
          addWatermark();
        },
      });

      // @ts-ignore
      finalY = doc.lastAutoTable.finalY;

      // Total Row
      autoTable(doc, {
        startY: finalY,
        body: [
          [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Total",
            monthData.stats.total.toLocaleString("en-IN"),
          ],
        ],
        theme: "plain",
        styles: { fontStyle: "bold", fontSize: 9 },
        columnStyles: { 10: { halign: "right" } },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          addWatermark();
        },
      });
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY;

      if (
        monthData.stats.paymentHistory &&
        monthData.stats.paymentHistory.length > 0
      ) {
        const paymentRows = monthData.stats.paymentHistory.map((p) => {
          const amountText =
            p.isDiscountApplied && p.discount
              ? `(${p.discount.toLocaleString("en-IN")} Off) ${p.amount.toLocaleString("en-IN")}`
              : p.amount.toLocaleString("en-IN");

          return [
            format(new Date(p.paymentDate), "dd/MM/yyyy"),
            `Payment Received (${p.paymentMode})`,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            amountText,
          ];
        });

        autoTable(doc, {
          startY: finalY,
          body: paymentRows,
          theme: "plain",
          styles: { fontSize: 9 },
          columnStyles: { 10: { halign: "right" } },
          margin: { left: 14, right: 14 },
          didDrawPage: () => {
            addWatermark();
          },
        });
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY;
      }

      autoTable(doc, {
        startY: finalY,
        body: [
          [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Balance",
            monthData.stats.pending.toLocaleString("en-IN"),
          ],
        ],
        theme: "plain",
        styles: {
          fontStyle: "bold",
          fontSize: 9,
          fillColor: [255, 255, 0],
        },
        columnStyles: { 10: { halign: "right" } },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          addWatermark();
        },
      });
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 5;
    });

    // Add watermark to the first page (title page)
    const totalPages = doc.getNumberOfPages();
    doc.setPage(1);
    addWatermark();

    doc.save(`Ledger_${customerName}_${startDate}.pdf`);
    setIsExporting(false);
  };

  const generateExcel = () => {
    if (!reportData || reportData.length === 0) return;

    setIsExporting(true);

    const customer = customers.find(
      (c: any) => (c.id || c.customerId).toString() === customerId
    );
    const customerName = customer ? `${customer.firstname}` : "Customer";

    const wsData: any[][] = [];
    const highlightRows: number[] = [];

    reportData.forEach((monthData) => {
      // Month Header
      wsData.push([monthData.month.toUpperCase()]);

      // Table Header
      wsData.push([
        "Date",
        "Item Name",
        "Height",
        "Width",
        "Sq ft",
        "Total sq ft",
        "Rate",
        "1 pc rate",
        "Qty",
        "Extra Charge",
        "Amount",
      ]);

      // Entries
      monthData.entries.forEach((entry) => {
        wsData.push([
          format(new Date(entry.date), "dd-MMM-yyyy"),
          entry.productName,
          entry.height,
          entry.width,
          entry.sqFt,
          (entry.sqFt * entry.quantity).toFixed(2),
          entry.basePrice,
          entry.ratePerPiece,
          entry.quantity,
          entry.extraCharge,
          entry.amount,
        ]);
      });

      // Total Row
      wsData.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total",
        monthData.stats.total,
      ]);
      highlightRows.push(wsData.length - 1);

      // Payment Rows
      if (
        monthData.stats.paymentHistory &&
        monthData.stats.paymentHistory.length > 0
      ) {
        monthData.stats.paymentHistory.forEach((p) => {
          const amountText =
            p.isDiscountApplied && p.discount
              ? `(₹${p.discount} Off) ${p.amount}`
              : p.amount;

          wsData.push([
            format(new Date(p.paymentDate), "dd/MM/yyyy"),
            `Payment Received (${p.paymentMode})`,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            amountText,
          ]);
        });
      }

      // Balance Row
      wsData.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Balance",
        monthData.stats.pending,
      ]);
      highlightRows.push(wsData.length - 1);

      wsData.push([]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 30 }, // Item Name
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 6 },
      { wch: 12 },
      { wch: 15 },
    ];

    highlightRows.forEach((rowIndex) => {
      for (let colIndex = 0; colIndex <= 10; colIndex++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: rowIndex,
          c: colIndex,
        });

        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: "s", v: "" };
        }

        ws[cellAddress].s = {
          fill: {
            fgColor: { rgb: "FFFF00" },
          },
          font: {
            bold: true,
          },
        };
      }
    });

    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, `Ledger_${customerName}_${startDate}.xlsx`);
    setIsExporting(false);
  };

  return (
    <main className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/ledger")}
              className="rounded-full hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Ledger Report
              </h1>
              <p className="text-sm text-muted-foreground">
                View customer ledger statements
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Select Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <CustomerCombobox
                  customers={customers}
                  value={customerId}
                  onChange={setCustomerId}
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleFetchReport}
                disabled={!customerId || !startDate || !endDate || loading}
                className="min-w-[140px]"
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
          <div className="space-y-4">
            {/* Export Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Download the report in your preferred format
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generatePDF}
                  disabled={isExporting}
                  className="gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 text-red-500" />
                  )}
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={generateExcel}
                  disabled={isExporting}
                  className="gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  )}
                  Download Excel
                </Button>
              </div>
            </div>

            {/* Report Content */}
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
                              {pay.isDiscountApplied ? (
                                <span className="text-green-600 font-normal ml-2">
                                  (₹{pay.discount?.toLocaleString("en-IN")}{" "}
                                  Discount Applied)
                                </span>
                              ) : null}
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