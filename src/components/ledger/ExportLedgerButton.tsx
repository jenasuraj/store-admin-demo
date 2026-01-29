import { useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  X,
  Download,
  FileSpreadsheet, 
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import { useAppSelector } from "@/app/hooks";


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


import XLSX from "xlsx-js-style";

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
  discount?: number;
  isDiscountApplied?: boolean;
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
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-input"
        >
          {selectedCustomer ? selectedCustomer.firstname : "Select Customer..."}
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
                value="reset_selection_clear"
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
                const uniqueSearchValue = `${customer.firstname} ${
                  customer.lastname || ""
                } ${id}`;

                return (
                  <CommandItem
                    key={id}
                    value={uniqueSearchValue}
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

export default function ExportLedgerButton() {
  const { customers } = useAppSelector((state) => state.customer);

  const [isOpen, setIsOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!customerId || !startDate || !endDate) {
      alert("All fields (Customer, Start Date, End Date) are mandatory.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await axios.get<MonthData[]>(
        `${BASE_URL}/api/ledger/ledger-sheet`,
        {
          params: { customerId, startDate, endDate },
        }
      );

      const ledgerData = response.data;

      if (!ledgerData || ledgerData.length === 0) {
        alert("No ledger entries found for the selected period.");
        setIsGenerating(false);
        return;
      }

      const customer = customers.find(
        (c) => (c.id || c.customerId).toString() === customerId
      );
      const customerName = customer ? `${customer.firstname}` : "Customer";

      if (exportFormat === "pdf") {
        generatePDF(ledgerData, customerName);
      } else {
        generateExcel(ledgerData, customerName);
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Generation Error:", error);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = (ledgerData: MonthData[], customerName: string) => {
    const doc = new jsPDF();

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

    ledgerData.forEach((monthData) => {
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
      });

      // @ts-ignore
      finalY = doc.lastAutoTable.finalY;

      // Total Row
      autoTable(doc, {
        startY: finalY,
        body: [
          [
            "", "", "", "", "", "", "", "", "",
            "Total",
            monthData.stats.total.toLocaleString("en-IN"),
          ],
        ],
        theme: "plain",
        styles: { fontStyle: "bold", fontSize: 9 },
        columnStyles: { 10: { halign: "right" } },
        margin: { left: 14, right: 14 },
      });
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY;

      if (monthData.stats.paymentHistory && monthData.stats.paymentHistory.length > 0) {
        const paymentRows = monthData.stats.paymentHistory.map((p) => {
          const amountText = p.isDiscountApplied && p.discount
            ? `(${p.discount.toLocaleString("en-IN")} Off) ${p.amount.toLocaleString("en-IN")}`
            : p.amount.toLocaleString("en-IN");
          
          return [
            format(new Date(p.paymentDate), "dd/MM/yyyy"),
            `Payment Received (${p.paymentMode})`,
            "", "", "", "", "", "", "", "",
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
        });
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY;
      }

      autoTable(doc, {
        startY: finalY,
        body: [
          [
            "", "", "", "", "", "", "", "", "",
            "Balance",
            monthData.stats.pending.toLocaleString("en-IN"),
          ],
        ],
        theme: "plain",
        styles: {
          fontStyle: "bold",
          fontSize: 9,
          fillColor: [255, 255, 0], // Yellow Highlight in PDF
        },
        columnStyles: { 10: { halign: "right" } },
        margin: { left: 14, right: 14 },
      });
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 5;
    });

    doc.save(`Ledger_${customerName}_${startDate}.pdf`);
  };

  const generateExcel = (ledgerData: MonthData[], customerName: string) => {
    const wsData: any[][] = [];
    
    const highlightRows: number[] = [];

    // wsData.push([`Ledger Statement - ${customerName}`]);
    // wsData.push([`Period: ${startDate} to ${endDate}`]);  // This block is removed now as per new design requirements according to excel if needed can be added later
    // wsData.push([]); // Spacer

    ledgerData.forEach((monthData) => {
      // Month Header
      wsData.push([monthData.month.toUpperCase()]);
      
      // Table Header
      wsData.push([
        "Date", "Item Name", "Height", "Width", "Sq ft", "Total sq ft", 
        "Rate", "1 pc rate", "Qty", "Extra Charge", "Amount"
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
        "", "", "", "", "", "", "", "", "", 
        "Total", 
        monthData.stats.total
      ]);
      highlightRows.push(wsData.length - 1); 

      // Payment Rows
      if (monthData.stats.paymentHistory && monthData.stats.paymentHistory.length > 0) {
        monthData.stats.paymentHistory.forEach((p) => {
          const amountText = p.isDiscountApplied && p.discount
            ? `(₹${p.discount} Off) ${p.amount}`
            : p.amount;
          
          wsData.push([
            format(new Date(p.paymentDate), "dd/MM/yyyy"),
            `Payment Received (${p.paymentMode})`,
            "", "", "", "", "", "", "", "",
            amountText
          ]);
        });
      }

      // Balance Row
      wsData.push([
        "", "", "", "", "", "", "", "", "", 
        "Balance", 
        monthData.stats.pending
      ]);
      highlightRows.push(wsData.length - 1);

      wsData.push([]); 
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 30 }, // Item Name
      { wch: 8 },  { wch: 8 }, { wch: 8 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 6 }, { wch: 12 }, { wch: 15 }
    ];

    
    highlightRows.forEach((rowIndex) => {
      for (let colIndex = 0; colIndex <= 10; colIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: 's', v: '' }; 
        }

        ws[cellAddress].s = {
          fill: {
            fgColor: { rgb: "FFFF00" } 
          },
          font: {
            bold: true
          }
        };
      }
    });

    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, `Ledger_${customerName}_${startDate}.xlsx`);
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 bg-white text-black border hover:bg-slate-50"
        onClick={() => setIsOpen(true)}
      >
        <Download className="w-4 h-4" /> Export
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Download Ledger</DialogTitle>
            <DialogDescription>
              Select criteria and format to generate the report.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <CustomerFilterCombobox
                customers={customers}
                value={customerId}
                onChange={setCustomerId}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(val: "pdf" | "excel") => setExportFormat(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span>PDF Document</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span>Excel Spreadsheet</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isGenerating
                ? "Generating..."
                : `Download ${exportFormat === "pdf" ? "PDF" : "Excel"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}