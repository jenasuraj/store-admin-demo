import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignAdmin from "@/Features/ManageCompany/AssignAdmin";
import CompanyMaster from "@/Features/ManageCompany/CompanyMaster";


export default function CompanyManager() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="companyMaster">
        <TabsList>
          <TabsTrigger value="companyMaster">Company Master</TabsTrigger>
          <TabsTrigger value="assignAdmin">Assign Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="companyMaster" className="mt-6">
          <CompanyMaster />
        </TabsContent>
        <TabsContent value="assignAdmin" className="mt-6">
          <AssignAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
