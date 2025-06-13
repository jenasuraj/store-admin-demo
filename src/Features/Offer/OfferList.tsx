import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ShadcnTable from "@/components/newShadcnTable/ShadcnTable";
import { Columns } from "./column";
import {
  fetchOfferAsync,
  selectOfferEntity,
  selectOfferError,
  selectOfferLoading,
} from "@/app/OfferSlice";

export default function OfferList() {
  const dispatch = useAppDispatch();

  const offerList = useAppSelector(selectOfferEntity);
  const discountLoading = useAppSelector(selectOfferLoading);
  const discountError = useAppSelector(selectOfferError);

  useEffect(() => {
    !offerList && dispatch(fetchOfferAsync(""));
  }, [offerList, dispatch]);

  if (offerList)
    return (
      <div className="space-y-2">
        <ShadcnTable
          data={offerList.content}
          columns={Columns}
          loading={discountLoading}
          api={true}
          currentPage={offerList ? offerList.pageable.pageNumber : 0}
          totalPages={offerList ? offerList.totalPages : 10}
          totalelement={offerList ? offerList.totalElements : 0}
          hideGlobalSearch={true}
          error={discountError}
          name="Offers"
        ></ShadcnTable>
      </div>
    );
}
