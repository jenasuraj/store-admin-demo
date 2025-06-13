import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import ProductTypeAttribute from "./ProductTypeAttribute/ProductTypeAttribute";
const Mapping = () => {
  return (
    <Tabs defaultValue="product-type-key-value">
      <TabsList className="flex w-fit">
        <TabsTrigger value="product-type-key-value">
          Product Type - Keys
        </TabsTrigger>
      </TabsList>
      <TabsContent value="product-type-key-value" className="w-full">
        <ProductTypeAttribute />
      </TabsContent>
    </Tabs>
  );
};

export default Mapping;
