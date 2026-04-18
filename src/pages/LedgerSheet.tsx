import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Plus,
  Download,
  X,
  Check,
  ChevronsUpDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Pencil,
  Save,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchLedgerEntries,
  setPage,
  setFilters,
  resetFilters,
} from "@/app/ledgerSheetSlice";
import { Customer, fetchCustomers } from "@/app/customerSlice";
import { toast } from "sonner";
import ExportLedgerButton from "@/components/ledger/ExportLedgerButton";
import { ColumnDef } from "@tanstack/react-table";
import ShadcnTable from "@/components/shadcnTable/ShadcnTable";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import XLSX from "xlsx-js-style";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";


type DatePickerProps = {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ date, onChange, placeholder }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal h-9"
        >
          {date ? format(date, "dd MMM yyyy") : placeholder || "Pick date"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="buttons"
          onDayClick={() => setIsOpen(false)}
          selected={date}
          onSelect={onChange}
          initialFocus
          disabled={(date) => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}

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

export default function LedgerSheetPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux
  const {
    entries,
    loading,
    totalPages,
    totalElements,
    currentPage,
    filterCustomerId,
    filterStartDate,
    filterEndDate,
  } = useAppSelector((state) => state.ledgerSheet);
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>()
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>()
  const [localCustomerId, setLocalCustomerId] = useState(filterCustomerId)

  const { customers } = useAppSelector((state) => state.customer);

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);


  // Init
  useEffect(() => {
    dispatch(fetchCustomers({ search: "" }));
    dispatch(fetchLedgerEntries());
  }, [dispatch]);

  // --- Filters & Pagination ---

  const handleFilterChange = (
    key: "customerId" | "startDate" | "endDate",
    value: string
  ) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(fetchLedgerEntries());
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(fetchLedgerEntries());
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      dispatch(setPage(newPage));
      dispatch(fetchLedgerEntries());
    }
  };

  // --- Edit Handlers ---
  const handleEditClick = (entry: any) => {
    // Directly use the basePrice from the API entry
    setEditingEntry({
      ...entry,
      basePrice: entry.basePrice || 0, // Default to 0 if missing for safety
    });
    setIsEditDialogOpen(true);
  };

  const handleEditFieldChange = (field: string, value: string | number) => {
    setEditingEntry((prev: any) => {
      // 1. Create a draft of the new state
      const updated = { ...prev, [field]: value };

      // Convert current inputs to numbers safely for calculation
      const width = parseFloat(updated.width || 0);
      const height = parseFloat(updated.height || 0);
      const quantity = parseFloat(updated.quantity || 0);
      let sqFt = parseFloat(updated.sqFt || 0);
      let ratePerPiece = parseFloat(updated.ratePerPiece || 0);
      const extraCharge = parseFloat(updated.extraCharge || 0);
      let basePrice = parseFloat(updated.basePrice || 0);
      let location = updated.location || "";
      // 2. Logic: If Width or Height changes -> Recalculate SqFt
      if (field === "width" || field === "height") {
        sqFt = Number((width * height).toFixed(2));
        updated.sqFt = sqFt;
      }

      // 3. Logic: If SqFt changes (directly or via W/H) -> Recalculate Rate Per Piece
      // We assume Rate Per Piece = Base Price (Rate/SqFt) * SqFt
      if (field === "width" || field === "height" || field === "sqFt") {
        // Recalculate Rate Per Piece based on the established base rate
        ratePerPiece = Number((sqFt * basePrice).toFixed(2));
        updated.ratePerPiece = ratePerPiece;
      }

      // 4. Logic: If Rate Per Piece is manually edited -> Update Base Price
      if (field === "ratePerPiece") {
        // If user explicitly changes rate per piece, we update the underlying base rate
        // so future dimension changes use this new rate.
        if (sqFt > 0) {
          basePrice = ratePerPiece / sqFt;
          updated.basePrice = basePrice;
        }
      }

      if (field === "basePrice") {
        // If user explicitly changes base price, we update the rate per piece accordingly
        ratePerPiece = Number((sqFt * basePrice).toFixed(2));
        updated.ratePerPiece = ratePerPiece;
      }

      // 5. Logic: Calculate Total SqFt
      // Total SqFt = SqFt * Quantity
      updated.totalSqft = Number((sqFt * quantity).toFixed(2));

      // 6. Logic: Calculate Final Amount
      // Amount = (RatePerPiece * Quantity) + ExtraCharge
      updated.amount = Number(
        (ratePerPiece * quantity + extraCharge).toFixed(0)
      );

      return updated;
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    setIsSaving(true);
    try {
      const payload = {
        height: Number(editingEntry.height),
        width: Number(editingEntry.width),
        sqft: Number(editingEntry.sqFt),
        quantity: Number(editingEntry.quantity),
        amount: Number(editingEntry.amount),
        date: editingEntry.date,
        extraCharge: Number(editingEntry.extraCharge || 0),
        ratePerPiece: Number(editingEntry.ratePerPiece || 0),
        basePrice: Number(editingEntry.basePrice || 0),
        totalSqft: `${editingEntry.totalSqft}`,
        location: editingEntry.location || "",
      };

      const url = `${BASE_URL}/api/ledger/${editingEntry.ledgerId}/item/${editingEntry.itemId}`;

      const response = await axios.put(url, payload);

      if (response.status === 200 || response.status === 201) {
        dispatch(fetchLedgerEntries());
        setIsEditDialogOpen(false);
        setEditingEntry(null);
        toast.success("Ledger entry updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update entry:", error);
      // alert("Failed to update the entry. Please check the inputs and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const column: ColumnDef<Customer>[] = [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "productName",
      header: "Product",
    },
    {
      accessorKey: "location",
      header: "Description",
    },
    {
      accessorKey: "dimensions",
      header: "Size (WxH)",
      cell: ({ row }) =>
        `${row.original.width} x ${row.original.height}`,

    },
    {
      accessorKey: "sqFt",
      header: "SqFt",
    },
    {
      accessorKey: "basePrice",
      header: "Rate/SQFt",
    },
    {
      accessorFn: (row) => Number(row.sqFt) * Number(row.basePrice),
      header: "Total Rate",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "totalSqft",
      header: "Total SqFt",
    },
    {
      accessorKey: "extraCharge",
      header: "Extra Charge",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditClick(row.original)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      ),
    },
  ]

  const generatePDF = (
    ledgerData: any[],
    customerName: string,
    startDate: string,
    endDate: string
  ) => {
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
      const tableBody = monthData.entries.map((entry) => [
        format(new Date(entry.date), "dd-MMM-yyyy"),
        entry.productName,
        entry.location,
        entry.height,
        entry.width,
        entry.sqFt,
        entry.basePrice,
        Number(entry.sqFt) * Number(entry.basePrice),
        (entry.quantity),
        entry.totalSqft,
        entry.extraCharge,
        entry.amount.toLocaleString("en-IN"),
      ]);

      autoTable(doc, {
        startY: finalY + 15,
        head: [
          [
            "Date",
            "Product Name",
            "Description",
            "H",
            "W",
            "Sq ft",
            "Rate/SQFt",
            "Total Rate",
            "Qty",
            "Total Sqft",
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

  const generateExcel = (
    ledgerData: any[],
    customerName: string,
    startDate: string
  ) => {
    const wsData: any[][] = [];

    const highlightRows: number[] = [];

    // wsData.push([`Ledger Statement - ${customerName}`]);
    // wsData.push([`Period: ${startDate} to ${endDate}`]);  // This block is removed now as per new design requirements according to excel if needed can be added later
    // wsData.push([]); // Spacer

    ledgerData.forEach((monthData) => {
      // Month Header
      wsData.push([monthData.month.toUpperCase()]);

      // Table Header
      wsData.push(
        [
          "Date",
          "Product Name",
          "Description",
          "H",
          "W",
          "Sq ft",
          "Rate/SQFt",
          "Total Rate",
          "Qty",
          "Total Sqft",
          "Extra",
          "Amount",
        ],
      );

      // Entries
      monthData.entries.forEach((entry) => {
        wsData.push([
          format(new Date(entry.date), "dd-MMM-yyyy"),
          entry.productName,
          entry.location,
          entry.height,
          entry.width,
          entry.sqFt,
          entry.basePrice,
          Number(entry.sqFt) * Number(entry.basePrice),
          (entry.quantity),
          entry.totalSqft,
          entry.extraCharge,
          entry.amount.toLocaleString("en-IN"),
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
      { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
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

  const exportLedger = async ({
    customerId,
    startDate,
    endDate,
    format,
    customers,
  }: {
    customerId: string;
    startDate: string;
    endDate: string;
    format: "pdf" | "excel";
    customers: any[];
  }) => {
    if (!customerId || !startDate || !endDate) {
      toast.error("Please select Customer and Date range first.");
      return;
    }

    const response = await axios.get(`${BASE_URL}/api/ledger/ledger-sheet`, {
      params: { customerId, startDate, endDate },
    });

    const ledgerData = response.data;

    if (!ledgerData || ledgerData.length === 0) {
      toast.error("No data found");
      return;
    }

    const customer = customers.find(
      (c) => (c.id || c.customerId).toString() === customerId
    );

    const customerName = customer?.firstname || "Customer";

    if (format === "pdf") {
      generatePDF(ledgerData, customerName, startDate, endDate);
    } else {
      generateExcel(ledgerData, customerName, startDate);
    }
  };

  return (
    <main className="min-h-screen bg-muted/10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <Card className="border shadow-sm overflow-hidden bg-white">
          <ShadcnTable
            title="Ledger Sheet"
            data={entries}
            columns={column}
            loading={loading}
            error={false}
            hideExcel={true}
          >
            {/* FILTER ROW */}
            <div className="flex gap-4 items-end">

              {/* FROM */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <DatePicker
                  date={localStartDate}
                  onChange={setLocalStartDate}
                  placeholder="Select start date"
                />
              </div>

              {/* TO */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
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

              {/* APPLY BUTTON */}
              <div>
                <Button
                  className="w-full"
                  onClick={() => {
                    dispatch(setFilters({
                      customerId: localCustomerId,
                      startDate: localStartDate
                        ? format(localStartDate, "yyyy-MM-dd")
                        : "",
                      endDate: localEndDate
                        ? format(localEndDate, "yyyy-MM-dd")
                        : "",
                    }))
                    dispatch(fetchLedgerEntries())
                  }}
                >
                  Apply
                </Button>
              </div>

              {/* CLEAR BUTTON */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setLocalStartDate("");
                    setLocalEndDate("");
                    setLocalCustomerId("");
                    dispatch(resetFilters());
                    dispatch(fetchLedgerEntries());
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    exportLedger({
                      customerId: filterCustomerId,
                      startDate: filterStartDate,
                      endDate: filterEndDate,
                      format: "excel",
                      customers,
                    })
                  }
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  Download to Excel
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    exportLedger({
                      customerId: filterCustomerId,
                      startDate: filterStartDate,
                      endDate: filterEndDate,
                      format: "pdf",
                      customers,
                    })
                  }
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Download to PDF
                </Button>
              </div>

            </div>

          </ShadcnTable>

          {/* Footer Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
            <div className="text-xs text-muted-foreground">
              Showing {entries.length} items (Total: {totalElements})
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

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingEntry(null);
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Ledger Entry</DialogTitle>
            <DialogDescription>
              Update the details for this transaction. Product and Customer
              cannot be changed.
            </DialogDescription>
          </DialogHeader>

          {editingEntry && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingEntry.date}
                    onChange={(e) =>
                      handleEditFieldChange("date", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    onChange={(e) =>
                      handleEditFieldChange("location", e.target.value)
                    }
                    value={editingEntry.location}
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Input disabled value={editingEntry.customerName} />
                </div>
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Input disabled value={editingEntry.productName} />
                </div>
              </div>

              {/* Dimensions Row */}
              <div className="grid grid-cols-4 gap-4 bg-slate-50 p-3 rounded-md border">
                <div className="space-y-2">
                  <Label>Width (ft)</Label>
                  <Input
                    type="number"
                    value={editingEntry.width}
                    onChange={(e) =>
                      handleEditFieldChange("width", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (ft)</Label>
                  <Input
                    type="number"
                    value={editingEntry.height}
                    onChange={(e) =>
                      handleEditFieldChange("height", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-600 font-semibold">SqFt</Label>
                  <Input
                    type="number"
                    value={editingEntry.sqFt}
                    // Making SqFt readonly because it's calculated from W*H
                    // If you want it editable, remove readOnly but it might conflict with W/H
                    readOnly
                    className="bg-blue-50 border-blue-200 text-blue-700 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate /SQFT</Label>
                  <Input
                    type="number"
                    value={editingEntry.basePrice}
                    onChange={(e) =>
                      handleEditFieldChange("basePrice", e.target.value)
                    }
                  />
                </div>
                  <div className="space-y-2">
                  <Label>Total Rate</Label>
                  <Input
                    type="number"
                    value={editingEntry.ratePerPiece}
                    onChange={(e) =>
                      handleEditFieldChange("ratePerPiece", e.target.value)
                    }
                  />
                </div>
               
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-4 gap-4 p-3 rounded-md border">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingEntry.quantity}
                    onChange={(e) =>
                      handleEditFieldChange("quantity", e.target.value)
                    }
                  />
                </div>
                 <div className="space-y-2">
                  <Label>Total SqFt</Label>
                  <Input
                    type="number"
                    value={editingEntry.totalSqft}
                    readOnly
                    className="bg-muted text-muted-foreground"
                  />
                </div>
              
                <div className="space-y-2">
                  <Label>Extra Charge</Label>
                  <Input
                    type="number"
                    value={editingEntry.extraCharge}
                    onChange={(e) =>
                      handleEditFieldChange("extraCharge", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-green-700">Amount</Label>
                  <Input
                    type="number"
                    className="font-bold text-lg bg-green-50 border-green-200 text-green-800"
                    value={editingEntry.amount}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  );
}
