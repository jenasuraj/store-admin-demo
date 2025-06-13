import React, { useEffect, useState } from "react";
import { columns } from "./column";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchReturnAsync,
  selectReturnEntity,
  selectReturnError,
  selectReturnLoading,
} from "@/app/ReturnSlice";
import { useLocation } from "react-router-dom";
import ShadcnTable from "@/components/newShadcnTable/ShadcnTable";

function Returns() {
  const data = useAppSelector(selectReturnEntity);
  const loading = useAppSelector(selectReturnLoading);
  const error = useAppSelector(selectReturnError);
  const dispatch = useAppDispatch();
  const params = useLocation().search;

  useEffect(() => {
    (async () => {
      try {
        await dispatch(fetchReturnAsync("")).unwrap();
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    })();
  }, []);

  return (
    <ShadcnTable
      loading={loading}
      error={error}
      columns={columns}
      data={loading ? [] : data?.content || []}
      api={true}
      name="Return History"
      currentPage={data ? data?.pageable?.pageNumber : 0}
      totalPages={data ? data?.totalPages : 10}
      pageSize={data ? data.size : 0}
      totalelement={data ? data.totalElements : 0}
    />
  );
}

export default Returns;
