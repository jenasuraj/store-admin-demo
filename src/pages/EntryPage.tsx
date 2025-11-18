import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import {
  PriceListProduct,
  getCustomers,
  Customer,
  saveLedgerEntry,
  LedgerEntry,
  LedgerItem,
  getPriceLists,
  PriceList,
  initializeDemoData
} from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ComboboxItem {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  items: ComboboxItem[];
  selectedValues: string[];
  setSelectedValues: (v: string[]) => void;
  placeholder?: string;
  title?: string;
}

function MultiSelectCombobox({
  items,
  selectedValues,
  setSelectedValues,
  placeholder = 'Select items...',
  title = 'Select items'
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(

  (v: string) =>
    //@ts-ignore
    setSelectedValues(prev =>
        prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
      ),
    [setSelectedValues]
  );
  const remove = useCallback(
  //@ts-ignore
    (v: string) => setSelectedValues(prev => prev.filter(x => x !== v)),
    [setSelectedValues]
  );

  const max = 2;
  const visible = expanded ? selectedValues : selectedValues.slice(0, max);
  const hidden = selectedValues.length - visible.length;

  return (
    <div className="w-full max-w-md space-y-2">
      <Label>{title}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
          >
            <div className="flex flex-wrap items-center gap-1 pr-2.5">
              {selectedValues.length ? (
                <>
                  {visible.map(v => {
                    const it = items.find(i => i.value === v);
                    return it ? (
                      <Badge key={v} variant="outline">
                        {it.label}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-4 ml-1"
                          onClick={e => {
                            e.stopPropagation();
                            remove(v);
                          }}
                          asChild
                        >
                          <span>
                            <XIcon className="size-3" />
                          </span>
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                  {(hidden > 0 || expanded) && (
                    <Badge
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        setExpanded(p => !p);
                      }}
                    >
                      {expanded ? 'Show Less' : `+${hidden} more`}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 max-h-96 overflow-y-auto">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {items.map(it => (
                  <CommandItem
                    key={it.value}
                    value={it.value}
                    onSelect={() => toggle(it.value)}
                  >
                    <span className="truncate">{it.label}</span>
                    {selectedValues.includes(it.value) && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface LedgerItemForm {
  productId: string;
  description: string;
  width: number;
  height: number;
  extraCharges: number;
  quantity: number;
  price: number;
}

export default function CreateEntryPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [items, setItems] = useState<Record<string, LedgerItemForm>>({});
  const [mounted, setMounted] = useState(false);

  /* --------------------- Load Data --------------------- */
  useEffect(() => {
    setMounted(true);
    initializeDemoData();
    setCustomers(getCustomers());
    setPriceLists(getPriceLists());
  }, []);

  /* --------------------- Derived Data --------------------- */
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerPriceList = selectedCustomer
    ? priceLists.find(pl => pl.id === selectedCustomer.priceListId)
    : null;
  const availableProducts = customerPriceList ? customerPriceList.products : [];

  /* --------------------- Memoized Combobox Items (MUST be before early return) --------------------- */
  const productItems = useMemo(() => {
    return availableProducts.map(p => ({
      value: p.id,
      label: `${p.name} (${p.width}×${p.height}) - ₹${p.price}`
    }));
  }, [availableProducts]);



  /* --------------------- 1. Sync Rows with Selected Products --------------------- */
  useEffect(() => {
    const next: Record<string, LedgerItemForm> = {};

    selectedProductIds.forEach(id => {
      const prod = availableProducts.find(p => p.id === id);
      if (!prod) return;

      const existing = items[id];
      next[id] = {
        productId: id,
        description: existing?.description ?? '',
        width: existing?.width ?? 1,
        height: existing?.height ?? 1,
        extraCharges: existing?.extraCharges ?? 0,
        quantity: existing?.quantity ?? 1,
        price: prod.price
      };
    });

    setItems(next);
  }, [selectedProductIds, availableProducts]);

  /* --------------------- 2. Remove Invalid Products on Price List Change --------------------- */
  useEffect(() => {
    if (customerPriceList) {
      const stillValid = selectedProductIds.filter(id =>
        availableProducts.some(p => p.id === id)
      );
      if (stillValid.length !== selectedProductIds.length) {
        setSelectedProductIds(stillValid);
      }
    }
  }, [selectedCustomerId, availableProducts, selectedProductIds]);

  /* --------------------- Handlers --------------------- */
  const handleItemChange = (pid: string, field: string, value: any) => {
    setItems(prev => ({
      ...prev,
      [pid]: { ...prev[pid], [field]: value }
    }));
  };

  const calc = (prod: PriceListProduct, form: LedgerItemForm) => {
    const sqft = form.width * form.height;
    const pcRate = form.price * sqft;
    const total = pcRate * form.quantity + form.extraCharges;
    return { sqft, pcRate, total };
  };

  const handleSubmit = () => {
    if (!selectedCustomerId) return alert('Select a customer');
    if (!selectedProductIds.length) return alert('Select at least one product');

    const ledgerItems: LedgerItem[] = selectedProductIds
      .map(pid => {
        const form = items[pid];
        const prod = availableProducts.find(p => p.id === pid);
        if (!form || !prod) return null;
        const { sqft, pcRate, total } = calc(prod, form);
        return {
          id: Date.now().toString() + Math.random(),
          productId: pid,
          description: form.description,
          width: form.width,
          height: form.height,
          sqft,
          rate: form.price,
          pcRate,
          quantity: form.quantity,
          extraCharges: form.extraCharges,
          amount: total
        };
      })
      .filter(Boolean) as LedgerItem[];

    const totalAmount = ledgerItems.reduce((s, i) => s + i.amount, 0);

    const entry: LedgerEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomerId,
      items: ledgerItems,
      totalAmount,
      createdAt: new Date().toISOString()
    };

    saveLedgerEntry(entry);
    alert('Entry created successfully!');
    navigate('/ledger-sheet');
    };
    
      /* --------------------- Early Return (after all hooks!) --------------------- */
  if (!mounted) return null;

  /* --------------------- Total Calculation --------------------- */
  let totalAmount = 0;
  Object.entries(items).forEach(([id, form]) => {
    const prod = availableProducts.find(p => p.id === id);
    if (prod) totalAmount += calc(prod, form).total;
  });

  /* --------------------- Render --------------------- */
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Ledger Entry
          </h1>
          <p className="text-muted-foreground">
            Select a customer and products to create a new ledger entry
          </p>
        </div>

        {customers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Please add customers first
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Customer */}
            <div>
              <Label htmlFor="customer">Customer Name</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.mobile})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && customerPriceList && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Price List:{' '}
                  <span className="font-semibold text-foreground">
                    {customerPriceList.name}
                  </span>
                </p>
              </div>
            )}

            {/* Products */}
            {selectedCustomer && availableProducts.length > 0 && (
              <div>
                <MultiSelectCombobox
                  items={productItems}
                  selectedValues={selectedProductIds}
                  setSelectedValues={setSelectedProductIds}
                  placeholder="Select products..."
                  title="Products"
                />
              </div>
            )}

            {/* Table */}
            {selectedProductIds.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Product Details
                </Label>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Product</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Width</TableHead>
                        <TableHead>Height</TableHead>
                        <TableHead>Sq Ft</TableHead>
                        <TableHead>Rate (1×1)</TableHead>
                        <TableHead>1 pc Rate</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Extra Charges</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProductIds.map(pid => {
                        const form = items[pid];
                        const prod = availableProducts.find(p => p.id === pid);
                        if (!form || !prod) return null;
                        const { sqft, pcRate, total } = calc(prod, form);

                        return (
                          <TableRow key={pid}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {prod.name}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Input
                                type="text"
                                value={form.description}
                                onChange={e =>
                                  handleItemChange(pid, 'description', e.target.value)
                                }
                                placeholder="Optional"
                                className="text-xs"
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={form.width}
                                onChange={e =>
                                  handleItemChange(
                                    pid,
                                    'width',
                                    parseFloat(e.target.value) || 1
                                  )
                                }
                                className="w-16 text-xs"
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={form.height}
                                onChange={e =>
                                  handleItemChange(
                                    pid,
                                    'height',
                                    parseFloat(e.target.value) || 1
                                  )
                                }
                                className="w-16 text-xs"
                              />
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {sqft.toFixed(2)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={e =>
                                  handleItemChange(
                                    pid,
                                    'price',
                                    parseFloat(e.target.value) || prod.price
                                  )
                                }
                                className="w-20 text-xs"
                              />
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              ₹{pcRate.toFixed(2)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={form.quantity}
                                onChange={e =>
                                  handleItemChange(
                                    pid,
                                    'quantity',
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-16 text-xs"
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.extraCharges}
                                onChange={e =>
                                  handleItemChange(
                                    pid,
                                    'extraCharges',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="w-20 text-xs"
                              />
                            </TableCell>
                            <TableCell className="text-sm font-semibold">
                              ₹{total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Total */}
            {selectedProductIds.length > 0 && (
              <div className="flex justify-end">
                <div className="space-y-2 text-right">
                  <p className="text-lg font-semibold">
                    Total:{' '}
                    <span className="text-2xl text-blue-600">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedCustomerId || selectedProductIds.length === 0}
              >
                Save Entry
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}