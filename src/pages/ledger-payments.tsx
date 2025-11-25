import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentForm from "@/Features/LedgerPayment/PaymentForm";
import TransactionList from "@/Features/LedgerPayment/transaction-list";

export default function LedgerPaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const currentTab = searchParams.get("tab") || "payments";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", value);
      return newParams;
    });
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="payments">Record Payments</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <PaymentForm />
          </TabsContent>
          <TabsContent value="transactions" className="space-y-6">
            <TransactionList />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
