import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLedgerEntries, getCustomers, getPriceLists, LedgerEntry, Customer, PriceList } from '@/lib/storage';
import { ArrowLeft, Search, Plus, Download, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LedgerPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [mounted, setMounted] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchCustomer, setSearchCustomer] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setEntries(getLedgerEntries());
    setCustomers(getCustomers());
    setPriceLists(getPriceLists());
  }, []);

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  const getProductName = (productId: string) => {
    for (const list of priceLists) {
      const product = list.products.find(p => p.id === productId);
      if (product) return product.name;
    }
    return 'Unknown';
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const customerName = getCustomerName(entry.customerId).toLowerCase();
      const entryDate = new Date(entry.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (selectedCustomerId && entry.customerId !== selectedCustomerId) {
        return false;
      }

      if (searchCustomer && !customerName.includes(searchCustomer.toLowerCase())) {
        return false;
      }

      if (start && entryDate < start) return false;
      if (end) {
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }

      return true;
    });
  }, [entries, selectedCustomerId, searchCustomer, startDate, endDate]);

  const customerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      const customerId = entry.customerId;
      totals[customerId] = (totals[customerId] || 0) + entry.totalAmount;
    });
    return totals;
  }, [filteredEntries]);

  const downloadExcel = () => {
    if (filteredEntries.length === 0) {
      alert('No entries to export');
      return;
    }

    let csvContent = 'Date,Customer,Total Amount,Items\n';
    filteredEntries.forEach(entry => {
      csvContent += `${new Date(entry.date).toLocaleDateString()},${getCustomerName(entry.customerId)},₹${entry.totalAmount.toFixed(2)},${entry.items.length}\n`;
    });

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!mounted) return null;

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  const showAddCustomerOption = searchCustomer.trim() && filteredCustomers.length === 0;
  const hasFilters = selectedCustomerId || searchCustomer || startDate || endDate;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className=" bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Ledger</h1>
              <p className="text-sm text-neutral-600 mt-1">Track all your journal entries and transactions</p>
            </div>
            <Button 
              size="lg"
              className="gap-2"
              onClick={() => navigate('/ledger/add')}
            >
              <Plus className="w-4 h-4" />
              Create Journal Entry
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Card */}
        <Card className="mb-6 border-neutral-200">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Refine your ledger entries</CardDescription>
              </div>
              {hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomerId('');
                    setSearchCustomer('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="gap-1 w-28"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
             <div className="flex flex-row items-end justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-28 gap-2"
                  onClick={downloadExcel}
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <Label className="text-xs font-semibold text-neutral-600 block mb-2">Date Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start date"
                    className="text-sm"
                  />
                  <span className="flex items-center text-neutral-400">-</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End date"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Customer Filter Dropdown */}
              <div className='col-span-1'>
                <Label htmlFor="customer-filter" className="text-xs font-semibold text-neutral-600 block mb-2">Filter by Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All customers</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Customer */}
              <div>
                <Label htmlFor="search-customer" className="text-xs font-semibold text-neutral-600 block mb-2">Search Customer</Label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="search-customer"
                      placeholder="Search name..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                  {showAddCustomerOption && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 whitespace-nowrap text-sm"
                      onClick={() => navigate('/ledger-masters')}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
                  
             
            </div>
          </CardContent>
        </Card>

        {filteredEntries.length === 0 ? (
          <Card className="border-neutral-200">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">No entries found</p>
                <p className="text-neutral-500 text-sm mt-1">Create a new journal entry to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Main Entries Table */}
            <Card className="border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50 border-b border-neutral-200 hover:bg-neutral-50">
                      <TableHead className="text-neutral-600 font-semibold text-xs">Date (GMT+0530)</TableHead>
                      <TableHead className="text-neutral-600 font-semibold text-xs">Customer</TableHead>
                      <TableHead className="text-neutral-600 font-semibold text-xs">Items</TableHead>
                      <TableHead className="text-neutral-600 font-semibold text-xs text-right">Debit</TableHead>
                      <TableHead className="text-neutral-600 font-semibold text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map(entry => (
                      <TableRow key={entry.id} className="border-b border-neutral-200 hover:bg-neutral-50/50">
                        <TableCell className="text-sm font-medium text-neutral-900">
                          {new Date(entry.date).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })} 04:02:...
                        </TableCell>
                        <TableCell className="text-sm font-medium text-neutral-900">
                          {getCustomerName(entry.customerId)}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600">
                          {entry.items.length} items
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-neutral-900 text-right">
                          ₹{entry.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            {expandedEntry === entry.id ? 'Hide' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Expanded Entry Details */}
            {expandedEntry && (
              <Card className="border-neutral-200 bg-neutral-50/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900">
                      Entry Details — {new Date(filteredEntries.find(e => e.id === expandedEntry)?.date || '').toLocaleDateString()}
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white border-b border-neutral-200">
                            <TableHead className="text-neutral-600 font-semibold text-xs">Product</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">Description</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">Width</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">Height</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">Sq Ft</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">Rate</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">1 pc Rate</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">Qty</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs">Extra Charges</TableHead>
                            <TableHead className="text-neutral-600 font-semibold text-xs text-right">Debit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEntries.find(e => e.id === expandedEntry)?.items.map(item => (
                            <TableRow key={item.id} className="border-b border-neutral-200">
                              <TableCell className="text-sm font-medium text-neutral-900">{getProductName(item.productId)}</TableCell>
                              <TableCell className="text-sm text-neutral-600">{item.description || '—'}</TableCell>
                              <TableCell className="text-sm text-neutral-600">{item.width}</TableCell>
                              <TableCell className="text-sm text-neutral-600">{item.height}</TableCell>
                              <TableCell className="text-sm text-neutral-600">{item.sqft.toFixed(2)}</TableCell>
                              <TableCell className="text-sm text-neutral-600">₹{item.rate.toFixed(2)}</TableCell>
                              <TableCell className="text-sm text-neutral-600">₹{item.pcRate.toFixed(2)}</TableCell>
                              <TableCell className="text-sm text-neutral-600">{item.quantity}</TableCell>
                              <TableCell className="text-sm text-neutral-600">₹{item.extraCharges.toFixed(2)}</TableCell>
                              <TableCell className="text-sm font-semibold text-right">
                                <span className="text-emerald-600">₹{item.amount.toFixed(2)}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-neutral-200">
                      <p className="text-base font-semibold text-neutral-900">
                        Total: <span className="text-emerald-600">₹{filteredEntries.find(e => e.id === expandedEntry)?.totalAmount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Card */}
            <Card className="border-primary bg-blue-50 border-2">
              <CardHeader className="border-b border-blue-200 pb-4">
                <CardTitle className="text-neutral-900">Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {Object.entries(customerTotals).map(([customerId, total]) => (
                    <div key={customerId} className="flex justify-between items-center pb-3 border-b border-blue-100 last:border-b-0">
                      <span className="text-neutral-700 font-medium">{getCustomerName(customerId)}</span>
                      <span className="text-lg font-bold text-primary">₹{total.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t-2 border-blue-200">
                    <span className="text-neutral-900 font-semibold text-lg">Grand Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{Object.values(customerTotals).reduce((sum, total) => sum + total, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
