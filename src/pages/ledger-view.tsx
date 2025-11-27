import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LedgerSheetPage from "./LedgerSheet";
import LedgerReportPage from "./combined-ledger";

export default function LedgerViews() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="">
        <Tabs defaultValue="entries" className="space-y-6">
          <TabsList>
            <TabsTrigger value="entries">Ledger Entries</TabsTrigger>
            <TabsTrigger value="report">Ledger Report</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-6">
            <LedgerSheetPage />
          </TabsContent>
          <TabsContent value="report" className="space-y-6">
            <LedgerReportPage />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
