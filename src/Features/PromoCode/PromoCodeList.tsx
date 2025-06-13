import { Check, PlusCircle, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ShadcnTable from "@/components/newShadcnTable/ShadcnTable";
import { Columns } from "./column";
import {
  fetchPromoAsync,
  selectPromoEntity,
  selectPromoError,
  selectPromoLoading,
} from "@/app/PromoSlice";

export default function PromoCodeList() {
  const [isOn, setIsOn] = useState<{ [key: number]: boolean }>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const promoList = useAppSelector(selectPromoEntity);
  const promoLoading = useAppSelector(selectPromoLoading);
  const promoError = useAppSelector(selectPromoError);

  useEffect(() => {
    !promoList && dispatch(fetchPromoAsync(""));
  }, [promoList, dispatch]);

  if (promoList)
    return (
      <div className="space-y-2">
        <ShadcnTable
          data={promoList.content}
          columns={Columns}
          loading={promoLoading}
          api={true}
          currentPage={promoList ? promoList.pageable.pageNumber : 0}
          totalPages={promoList ? promoList.totalPages : 10}
          totalelement={promoList ? promoList.totalElements : 0}
          hideGlobalSearch={true}
          error={promoError}
          name="Promo Codes"
        ></ShadcnTable>
      </div>
    );
}
