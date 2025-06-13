import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DiscountList from "@/Features/Discounts/DiscountList";
import OfferList from "@/Features/Offer/OfferList";
import PromoCodeList from "@/Features/PromoCode/PromoCodeList";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DiscountPromoTabs = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2 sm:gap-5">
      <div>
        <Button
          onClick={() => {
            navigate("/createDiscountPromo");
          }}
        >
          Create New Code <PlusCircle size={16} />
        </Button>
      </div>
      <Tabs defaultValue="discount" className="">
        <TabsList>
          <TabsTrigger value="discount">Discount</TabsTrigger>
          <TabsTrigger value="promo">Promo</TabsTrigger>
          {/* <TabsTrigger value="offer">Offer</TabsTrigger> */}
        </TabsList>
        <TabsContent value="discount">
          <DiscountList />
        </TabsContent>
        <TabsContent value="promo">
          <PromoCodeList />
        </TabsContent>
        <TabsContent value="offer">
          <OfferList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiscountPromoTabs;
