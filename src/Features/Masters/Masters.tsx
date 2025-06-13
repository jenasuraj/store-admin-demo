import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Category from "./Category/Category";
import ProductType from "./ProductType/ProductType";
import AttributeValues from "./AttributeValues/AttributeValues";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import OrderStatus from "./OrderStatus/OrderStatus";
const Masters = () => {
  const roleId = useSelector((state: RootState) => state.user.user);

  return (
    <Tabs defaultValue="category">
      <TabsList className="flex w-fit">
        <TabsTrigger value="category">Category</TabsTrigger>
        <TabsTrigger value="product-type">Product Type</TabsTrigger>
        {roleId.authority_id == 1 && (
          <TabsTrigger value="attribute">Attribute</TabsTrigger>
        )}
        <TabsTrigger value="key-value">Attribute Values</TabsTrigger>
        <TabsTrigger value="order-status">Order Status</TabsTrigger>
        {/* <TabsTrigger value="transaction-type">Transaction Type</TabsTrigger> */}
      </TabsList>
      <TabsContent value="category" className="w-full">
        <Category />
      </TabsContent>
      <TabsContent value="product-type" className="w-full">
        <ProductType />
      </TabsContent>
      <TabsContent value="key-value" className="w-full">
        <AttributeValues />
      </TabsContent>
      <TabsContent value="order-status" className="w-full">
        <OrderStatus />
      </TabsContent>
    </Tabs>
  );
};

export default Masters;
