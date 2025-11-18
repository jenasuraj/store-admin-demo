import AssignSidebar from "@/components/sidebarManager/AssignSidebar";
import SidebarMaster from "@/components/sidebarManager/SidebarMaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function SidebarManager() {
  return (
    <Tabs defaultValue="sidebarMaster">
      <TabsList>
        <TabsTrigger value="sidebarMaster">Sidebar Master</TabsTrigger>
        <TabsTrigger value="assignSidebar">Assign Sidebar</TabsTrigger>
      </TabsList>
      <TabsContent value="sidebarMaster">
        <SidebarMaster />
      </TabsContent>
      <TabsContent value="assignSidebar">
        <AssignSidebar />
      </TabsContent>
    </Tabs>
  );
}
