import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { fetchCustomers } from "@/app/customerSlice";
import { toast } from "sonner";
import ExportLedgerButton from "@/components/ledger/ExportLedgerButton";

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

  const { customers } = useAppSelector((state) => state.customer);

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);


  // Init
  useEffect(() => {
    dispatch(fetchCustomers());
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

  return (
    <main className="min-h-screen bg-muted/10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Ledger Sheet
            </h1>
            <p className="text-muted-foreground text-sm">
              Track all transactions (Flat View)
            </p>
          </div>
          <div className="flex gap-2">
         <ExportLedgerButton/>
            <Button onClick={() => navigate("/ledger/add")} className="gap-2">
              <Plus className="w-4 h-4" /> New Entry
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Date Filters */}
              <div className="flex gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    className="h-9 w-[140px]"
                    value={filterStartDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    className="h-9 w-[140px]"
                    value={filterEndDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Customer Filter */}
              <div className="flex-1 md:max-w-[300px] space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Customer
                </Label>
                <CustomerFilterCombobox
                  customers={customers}
                  value={filterCustomerId}
                  onChange={(val) => handleFilterChange("customerId", val)}
                />
              </div>

              {/* Active Filter Indicator & Reset */}
              <div className="flex-1 flex items-center justify-end">
                {(filterCustomerId || filterStartDate || filterEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                  >
                    <X className="w-4 h-4 mr-1" /> Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Table - Flat View */}
        <Card className="border shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100/80 hover:bg-slate-100/80 border-b border-slate-200">
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700">
                    Date
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-bold text-slate-700">
                    Customer
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-bold text-slate-700">
                    Product
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-center">
                    Description
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-bold text-slate-700 text-center">
                    Size (WxH)
                  </TableHead>
                  <TableHead className="w-[80px] text-xs font-bold text-slate-700 text-center">
                    SqFt
                  </TableHead>
                  <TableHead className="w-[60px] text-xs font-bold text-slate-700 text-center">
                    Qty
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">
                    Rate/Pc
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">
                    Total Sqft
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">
                    Extra Charge
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">
                    Amount
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-center">
                    Image
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading
                        data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                      No ledger entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((row: any) => (
                    <TableRow
                      key={`${row.ledgerId}-${row.itemId}`}
                      className="hover:bg-slate-50 transition-colors border-b last:border-0"
                    >
                      {/* Date */}
                      <TableCell className="font-medium text-xs text-slate-600">
                        {row.date}
                      </TableCell>

                      {/* Customer */}
                      <TableCell
                        className="font-semibold text-xs text-foreground truncate max-w-[150px]"
                        title={row.customerName}
                      >
                        {row.customerName}
                      </TableCell>

                      {/* Product Info */}
                      <TableCell className="text-xs text-slate-700 font-medium">
                        {row.productName}
                        <div className="text-[10px] text-muted-foreground font-normal">
                          SKU #{row.productId}
                        </div>
                      </TableCell>
                      {/* Location */}
                      <TableCell className="text-center">
                        {row.location}
                      </TableCell>

                      {/* Dimensions */}
                      <TableCell className="text-center text-xs text-slate-600">
                        {row.width} x {row.height}
                      </TableCell>

                      {/* SqFt */}
                      <TableCell className="text-center text-xs text-slate-500">
                        {row.sqFt}
                      </TableCell>

                      {/* Qty */}
                      <TableCell className="text-center text-xs font-medium text-slate-700">
                        {row.quantity}
                      </TableCell>

                      {/* Rate */}
                      <TableCell className="text-right text-xs text-slate-600">
                        ₹{row.ratePerPiece}
                      </TableCell>
                      {/* Total Sqft */}
                      <TableCell className="text-right text-xs text-slate-600">
                        {row.totalSqft || (row.sqFt * row.quantity).toFixed(2)}
                      </TableCell>

                      {/* Extra charge */}
                      <TableCell className="text-right text-xs font-bold text-slate-800">
                        ₹{row.extraCharge}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right text-xs font-bold text-slate-800">
                        ₹{row.amount}
                      </TableCell>

                      {/* Image */}
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger>
                            {row.imageUrl && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                title="View Image"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </DialogTrigger>

                          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
                            <img
                              src={row.imageUrl}
                              alt="Ledger Entry"
                              className="object-contain max-w-full m-2 max-h-full"
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            onClick={() => handleEditClick(row)}
                            title="Edit Entry"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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
                  <Label>Location</Label>
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
                  <Label>Total SqFt</Label>
                  <Input
                    type="number"
                    value={editingEntry.totalSqft}
                    readOnly
                    className="bg-muted text-muted-foreground"
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
                  <Label>Rate / Pc</Label>
                  <Input
                    type="number"
                    value={editingEntry.ratePerPiece}
                    onChange={(e) =>
                      handleEditFieldChange("ratePerPiece", e.target.value)
                    }
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


     

      {/* Export Dialog (UI Only) */}
      {/* <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Ledger</DialogTitle>
            <DialogDescription>
              Select criteria to generate an export file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={exportStart}
                  onChange={(e) => setExportStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={exportEnd}
                  onChange={(e) => setExportEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Customer (Optional)</Label>
              <CustomerFilterCombobox
                customers={customers}
                value={exportCustomer}
                onChange={setExportCustomer}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowExportDialog(false)}>
              Download Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </main>
  );
}
