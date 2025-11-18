import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceListForm, PriceListsDisplay } from '@/components/ledger/PriceList';
import { CustomerForm, CustomersDisplay } from '@/components/ledger/CustomerForm';
import { getPriceLists, getCustomers, deletePriceList, deleteCustomer, PriceList, Customer } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function LedgerMaster() {
  const navigate = useNavigate();
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPriceLists(getPriceLists());
    setCustomers(getCustomers());
  }, []);

  const handleRefresh = () => {
    setPriceLists(getPriceLists());
    setCustomers(getCustomers());
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate('/ledger-dashboard')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Configuration</h1>
          <p className="text-muted-foreground">Create and manage your price lists and customers</p>
        </div>

        <Tabs defaultValue="priceLists" className="space-y-6">
          <TabsList>
            <TabsTrigger value="priceLists">Price Lists</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="priceLists" className="space-y-6">
            <PriceListForm onSave={handleRefresh} />
            <PriceListsDisplay 
              lists={priceLists}
              onDelete={(id) => {
                deletePriceList(id);
                handleRefresh();
              }}
            />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerForm priceLists={priceLists} onSave={handleRefresh} />
            <CustomersDisplay 
              customers={customers}
              priceLists={priceLists}
              onDelete={(id) => {
                deleteCustomer(id);
                handleRefresh();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}