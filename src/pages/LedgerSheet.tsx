import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchLedgerEntries, setPage, setFilters, resetFilters } from '@/app/ledgerSheetSlice';
import { fetchCustomers } from '@/app/customerSlice';
import { cn } from '@/lib/utils';

// --- Helper Component: Customer Filter ---
function CustomerFilterCombobox({ 
  customers, 
  value, 
  onChange 
}: { 
  customers: any[], 
  value: string, 
  onChange: (id: string) => void 
}) {
  const [open, setOpen] = useState(false);
  const selectedCustomer = customers.find(c => (c.id || c.customerId).toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-input"
        >
          {selectedCustomer ? selectedCustomer.firstname : "Filter by Customer..."}
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
    filterEndDate
  } = useAppSelector((state) => state.ledgerSheet);
  
  const { customers } = useAppSelector((state) => state.customer);

  // Local State
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Export State
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [exportCustomer, setExportCustomer] = useState('');

  // Init
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchLedgerEntries());
  }, [dispatch]);

  // --- Filters & Pagination ---

  const handleFilterChange = (key: 'customerId' | 'startDate' | 'endDate', value: string) => {
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

  return (
    <main className="min-h-screen bg-muted/10 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Ledger Sheet</h1>
            <p className="text-muted-foreground text-sm">Track all transactions (Flat View)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(true)} className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button onClick={() => navigate('/ledger/add')} className="gap-2">
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
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input 
                    type="date" 
                    className="h-9 w-[140px]" 
                    value={filterEndDate} 
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Customer Filter */}
              <div className="flex-1 md:max-w-[300px] space-y-1">
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <CustomerFilterCombobox 
                  customers={customers}
                  value={filterCustomerId}
                  onChange={(val) => handleFilterChange('customerId', val)}
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
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700">Date</TableHead>
                  <TableHead className="w-[180px] text-xs font-bold text-slate-700">Customer</TableHead>
                  <TableHead className="w-[200px] text-xs font-bold text-slate-700">Product</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-center">Location</TableHead>
                  <TableHead className="w-[120px] text-xs font-bold text-slate-700 text-center">Size (WxH)</TableHead>
                  <TableHead className="w-[80px] text-xs font-bold text-slate-700 text-center">SqFt</TableHead>
                  <TableHead className="w-[60px] text-xs font-bold text-slate-700 text-center">Qty</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">Rate/Pc</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">Total Sqft</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">Extra Charge</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-slate-700 text-right">Amount</TableHead>
                  <TableHead className="w-[60px] text-xs font-bold text-slate-700 text-center">Img</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={11} className="h-32 text-center">
                       <div className="flex justify-center items-center gap-2 text-muted-foreground">
                         <Loader2 className="h-5 w-5 animate-spin" /> Loading data...
                       </div>
                     </TableCell>
                   </TableRow>
                ) : entries.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                       <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                       No ledger entries found.
                     </TableCell>
                   </TableRow>
                ) : (
                  entries.map((row) => (
                    <TableRow 
                      key={`${row.ledgerId}-${row.itemId}`} 
                      className="hover:bg-slate-50 transition-colors border-b last:border-0"
                    >
                      {/* Date */}
                      <TableCell className="font-medium text-xs text-slate-600">
                        {row.date}
                      </TableCell>
                      
                      {/* Ledger ID */}
                      {/* <TableCell className="text-center text-xs font-mono text-slate-400">
                        #{row.ledgerId}
                      </TableCell> */}
                      
                      {/* Customer */}
                      <TableCell className="font-semibold text-xs text-foreground truncate max-w-[150px]" title={row.customerName}>
                        {row.customerName}
                      </TableCell>
                      
                      {/* Product Info */}
                      <TableCell className="text-xs text-slate-700 font-medium">
                        {row.productName}
                        <div className="text-[10px] text-muted-foreground font-normal">SKU #{row.productId}</div>
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
                        {row.totalSqft || row.sqFt * row.quantity}
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
                        {row.imageUrl ? (
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                             onClick={() => window.open(row.imageUrl, '_blank')}
                             title="View Image"
                           >
                             <Eye className="h-3.5 w-3.5" />
                           </Button>
                        ) : (
                          <span className="text-slate-200">-</span>
                        )}
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

      {/* Export Dialog (UI Only) */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
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
                <Input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Customer (Optional)</Label>
              <CustomerFilterCombobox customers={customers} value={exportCustomer} onChange={setExportCustomer} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowExportDialog(false)}>Download Excel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main> 
  );
}