import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Customer, PriceList, saveCustomer, getCustomers } from '@/lib/storage';
import { Trash2, Plus } from 'lucide-react';

export function CustomerForm({ 
  priceLists, 
  onSave 
}: { 
  priceLists: PriceList[];
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [priceListId, setPriceListId] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !mobile.trim() || !priceListId) {
      alert('Please fill in all fields');
      return;
    }

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name,
      mobile,
      priceListId,
      createdAt: new Date().toISOString()
    };

    saveCustomer(newCustomer);
    setName('');
    setMobile('');
    setPriceListId('');
    setShowForm(false);
    onSave();
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Add New Customer
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="priceList">Select Price List</Label>
            <Select value={priceListId} onValueChange={setPriceListId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a price list" />
              </SelectTrigger>
              <SelectContent>
                {priceLists.map(list => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="submit">Add Customer</Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CustomersDisplay({ 
  customers, 
  priceLists,
  onDelete 
}: { 
  customers: Customer[];
  priceLists: PriceList[];
  onDelete: (id: string) => void;
}) {
  const getPriceListName = (id: string) => {
    return priceLists.find(l => l.id === id)?.name || 'Unknown';
  };

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">No customers added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Price List</TableHead>
                <TableHead className="w-12">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell>{getPriceListName(customer.priceListId)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this customer?')) {
                          onDelete(customer.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}