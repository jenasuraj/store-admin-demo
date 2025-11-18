import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PriceList, PriceListProduct, savePriceList, getPriceLists } from '@/lib/storage';
import { Trash2, Plus } from 'lucide-react';

const DEMO_PRODUCTS = [
  { id: '1', name: 'E+L', height: 1, width: 1 },
  { id: '2', name: 'E+L+5mm', height: 1, width: 1 },
  { id: '3', name: 'Satin + Pipe', height: 1, width: 1 },
  { id: '4', name: 'E+3mm', height: 1, width: 1 },
  { id: '5', name: 'Eco +3mm', height: 1, width: 1 },
  { id: '6', name: 'Plain flex', height: 1, width: 1 },
  { id: '7', name: 'Canvas', height: 1, width: 1 },
  { id: '8', name: 'Flex new stande', height: 1, width: 1 },
];

export function PriceListForm({ onSave }: { onSave: () => void }) {
  const [listName, setListName] = useState('');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);

  const handlePriceChange = (productId: string, value: string) => {
    setPrices(prev => ({
      ...prev,
      [productId]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listName.trim()) {
      alert('Please enter a price list name');
      return;
    }

    const products: PriceListProduct[] = DEMO_PRODUCTS.map(p => ({
      ...p,
      sqft: p.height * p.width,
      price: prices[p.id] || 0
    }));

    const newList: PriceList = {
      id: Date.now().toString(),
      name: listName,
      products,
      createdAt: new Date().toISOString()
    };

    savePriceList(newList);
    setListName('');
    setPrices({});
    setShowForm(false);
    onSave();
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Create New Price List
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Price List</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="listName">Price List Name</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Standard List, Premium List"
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold mb-4 block">Set Prices for Products (Height: 1, Width: 1)</Label>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Height</TableHead>
                    <TableHead>Width</TableHead>
                    <TableHead>Sq Ft</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_PRODUCTS?.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.height}</TableCell>
                      <TableCell>{product.width}</TableCell>
                      <TableCell>{product.height * product.width}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={prices[product.id] || ''}
                          onChange={(e) => handlePriceChange(product.id, e.target.value)}
                          placeholder="0"
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit">Save Price List</Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setListName('');
                setPrices({});
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PriceListsDisplay({ lists, onDelete }: { lists: PriceList[]; onDelete: (id: string) => void }) {
  if (lists?.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">No price lists created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {lists?.map(list => (
        <Card key={list.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{list.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {list.products?.length} products
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Delete this price list?')) {
                    onDelete(list.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>H</TableHead>
                    <TableHead>W</TableHead>
                    <TableHead>Sq Ft</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.products?.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.height}</TableCell>
                      <TableCell>{product.width}</TableCell>
                      <TableCell>{product.sqft}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}