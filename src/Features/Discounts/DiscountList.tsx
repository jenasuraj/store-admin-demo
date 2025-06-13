import { Check, PlusCircle, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchDiscountAsync,
  selectDiscountEntity,
  selectDiscountError,
  selectDiscountLoading,
} from "@/app/DiscountSlice";
import ShadcnTable from "@/components/newShadcnTable/ShadcnTable";
import { Columns } from "./column";

export default function DiscountList() {
  const [isOn, setIsOn] = useState<{ [key: number]: boolean }>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const discountList = useAppSelector(selectDiscountEntity);
  const discountLoading = useAppSelector(selectDiscountLoading);
  const discountError = useAppSelector(selectDiscountError);

  useEffect(() => {
    !discountList && dispatch(fetchDiscountAsync(""));
  }, [discountList, dispatch]);

  if (discountList)
    return (
      <div className="space-y-2">
        <ShadcnTable
          data={discountList.content}
          columns={Columns}
          loading={discountLoading}
          api={true}
          currentPage={discountList ? discountList.pageable.pageNumber : 0}
          totalPages={discountList ? discountList.totalPages : 10}
          totalelement={discountList ? discountList.totalElements : 0}
          hideGlobalSearch={true}
          error={discountError}
          name="Discounts"
        ></ShadcnTable>
      </div>
    );
}
