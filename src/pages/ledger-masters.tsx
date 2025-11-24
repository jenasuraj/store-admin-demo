import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PriceListManager from '@/components/ledger/PriceList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerForm from '@/components/ledger/CustomerForm';

export default function LedgerMaster() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const currentTab = searchParams.get('tab') || 'customers';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', value);
      return newParams;
    });
  };

  const handleNavigateToPriceList = (userId: string) => {
    setSearchParams({ tab: 'priceLists', userId });
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Manage Configuration</h1>
          <p className="text-muted-foreground">Create and manage your price lists and customers</p>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="priceLists">Price Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            <CustomerForm   />
            {/* <CustomersDisplay /> */}
          </TabsContent>
          <TabsContent value="priceLists" className="space-y-6">
            <PriceListManager/>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}