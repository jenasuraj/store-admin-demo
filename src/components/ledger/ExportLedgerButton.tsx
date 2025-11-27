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
  Loader2,
  FileText,
  Check,
  ChevronsUpDown,
  X,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import { useAppSelector } from "@/app/hooks";

// Real imports for PDF generation
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Types for API Response ---
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

// --- Customer Filter Component ---
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
    // FIX: modal={true} ensures Popover works correctly inside a Dialog
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
                // FIX: Ensure 'value' is unique and searchable (Name + ID)
                // This prevents selection bugs in cmdk when names are duplicates
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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!customerId || !startDate || !endDate) {
      // You can replace this with your toast notification if you prefer
      alert("All fields (Customer, Start Date, End Date) are mandatory.");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Fetch Data
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

      // 2. Generate PDF
      const doc = new jsPDF();
      const customer = customers.find(
        (c) => (c.id || c.customerId).toString() === customerId
      );
      const customerName = customer ? `${customer.firstname}` : "Customer";

      // Header
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

      // Process Month Blocks
      ledgerData.forEach((monthData) => {
        // Month Title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(monthData.month, 14, finalY + 10);

        // Entries Table
        const tableBody = monthData.entries.map((entry) => [
          format(new Date(entry.date), "dd-MMM-yyyy"),
          entry.productName,
          entry.productName.toLowerCase().includes("standee") ||
          entry.productName.toLowerCase().includes("frame")
            ? "-"
            : `(${entry.width}x${entry.height})`,
          entry.width,
          entry.height,
          entry.sqFt,
          entry.totalSqft,
          entry.basePrice,
          entry.ratePerPiece,
          entry.quantity,
          entry.extraCharge > 0,
          entry.amount.toLocaleString("en-IN"),
        ]);

        autoTable(doc, {
          startY: finalY + 15,
          head: [
            [
              "Date",
              "Name",
              "Description",
              "Width",
              "Height",
              "Sq ft",
              "Total sq ft",
              "Rate",
              "1 pc rate",
              "Qty",
              "Extra Charge",
              "Amount",
            ],
          ],
          body: tableBody,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 20 }, // Date
            1: { cellWidth: 25 }, // Name
            10: { halign: "right" }, // Amount
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
        });
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY;

        // Payments
        if (
          monthData.stats.paymentHistory &&
          monthData.stats.paymentHistory.length > 0
        ) {
          const paymentRows = monthData.stats.paymentHistory.map((p) => [
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
            p.amount.toLocaleString("en-IN"),
          ]);

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

        // Balance Row (Yellow Highlight)
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
            fillColor: [255, 255, 0], // Yellow
          },
          columnStyles: { 10: { halign: "right" } },
          margin: { left: 14, right: 14 },
        });
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 5;
      });

      doc.save(`Ledger_${customerName}_${startDate}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
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
            <DialogTitle>Download Ledger PDF</DialogTitle>
            <DialogDescription>
              Select customer and date range to generate the report.
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
