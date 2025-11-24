import { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PriceListProduct, getCustomers, Customer, saveLedgerEntry, LedgerEntry, LedgerItem, getPriceLists, PriceList } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export function EntryModal({
  products,
  onClose
}: {
  products: PriceListProduct[];
  onClose: () => void;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<Record<string, LedgerItemForm>>({});
  const [mounted, setMounted] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    const custs = getCustomers();
    const lists = getPriceLists();
    setCustomers(custs);
    setPriceLists(lists);

    // Initialize items with default values
    const defaultItems: Record<string, LedgerItemForm> = {};
    products.forEach(product => {
      defaultItems[product.id] = {
        productId: product.id,
        description: '',
        width: 1,
        height: 1,
        extraCharges: 0,
        quantity: 1,
        price: product.price
      };
    });
    setItems(defaultItems);
  }, [products]);

  
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerPriceList = selectedCustomer 
    ? priceLists.find(pl => pl.id === selectedCustomer.priceListId)
    : null;
    
    // Update item prices when customer changes
    useEffect(() => {
      if (customerPriceList && selectedCustomerId) {
        const updatedItems: Record<string, LedgerItemForm> = {};
        products.forEach(product => {
        const priceListProduct = customerPriceList.products.find(p => p.id === product.id);
        const currentItem = items[product.id];
        updatedItems[product.id] = {
          ...currentItem,
          price: priceListProduct?.price || product.price
        };
      });
      setItems(updatedItems);
    }
  }, [selectedCustomerId]);
  
  const handleItemChange = (productId: string, field: string, value: any) => {
    setItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };
  
  const calculateItem = (product: PriceListProduct, form: LedgerItemForm) => {
    const sqft = form.width * form.height;
    const rate = form.price; // Use the editable price from form
    const pcRate = rate * sqft;
    const itemTotal = pcRate * form.quantity + form.extraCharges;
    
    return {
      sqft,
      rate,
      pcRate,
      itemTotal
    };
  };
  
  if (!mounted) return null;
  const handleSubmit = () => {
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    const ledgerItems: LedgerItem[] = products
      .map(product => {
        const form = items[product.id];
        const calc = calculateItem(product, form);
        
        return {
          id: Date.now().toString() + Math.random(),
          productId: product.id,
          description: form.description,
          width: form.width,
          height: form.height,
          sqft: calc.sqft,
          rate: calc.rate,
          pcRate: calc.pcRate,
          quantity: form.quantity,
          extraCharges: form.extraCharges,
          amount: calc.itemTotal
        };
      });

    const totalAmount = ledgerItems.reduce((sum, item) => sum + item.amount, 0);

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
    onClose();
    navigate('/ledger-sheet');
  };

  let totalAmount = 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ledger Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <Label htmlFor="customer">Customer Name</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.mobile})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCustomer && customerPriceList && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Price List: <span className="font-semibold text-foreground">{customerPriceList.name}</span>
              </p>
            </div>
          )}

          {/* Items Table */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Product Details</Label>
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
                  {products.map(product => {
                    const form = items[product.id];
                    if (!form) return null;

                    const calc = calculateItem(product, form);
                    totalAmount += calc.itemTotal;

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium whitespace-nowrap">{product.name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Input
                            size={3}
                            type="text"
                            value={form.description}
                            onChange={(e) => handleItemChange(product.id, 'description', e.target.value)}
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
                            onChange={(e) => handleItemChange(product.id, 'width', parseFloat(e.target.value) || 1)}
                            className="w-16 text-xs"
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={form.height}
                            onChange={(e) => handleItemChange(product.id, 'height', parseFloat(e.target.value) || 1)}
                            className="w-16 text-xs"
                          />
                        </TableCell>
                        <TableCell className="text-sm font-medium">{calc.sqft.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => handleItemChange(product.id, 'price', parseFloat(e.target.value) || product.price)}
                            className="w-20 text-xs"
                          />
                        </TableCell>
                        <TableCell className="text-sm font-medium">₹{calc.pcRate.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={form.quantity}
                            onChange={(e) => handleItemChange(product.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 text-xs"
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.extraCharges}
                            onChange={(e) => handleItemChange(product.id, 'extraCharges', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-20 text-xs"
                          />
                        </TableCell>
                        <TableCell className="text-sm font-semibold">₹{calc.itemTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="space-y-2 text-right">
              <p className="text-lg font-semibold">
                Total: <span className="text-2xl text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Entry</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
