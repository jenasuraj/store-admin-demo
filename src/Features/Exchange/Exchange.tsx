import { useEffect } from "react";
import { columns } from "./column";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchExchangeAsync,
  selectExchangeEntity,
  selectExchangeError,
  selectExchangeLoading,
} from "@/app/ExchangeSlice";
import ShadcnTable from "@/components/newShadcnTable/ShadcnTable";

function Exchange() {
  const data = useAppSelector(selectExchangeEntity);
  const error = useAppSelector(selectExchangeError);
  const loading = useAppSelector(selectExchangeLoading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchExchangeAsync(""));
  }, []);

  if (data)
    return (
      <ShadcnTable
        columns={columns}
        data={data.content ? data.content : []}
        loading={loading}
        error={error}
        currentPage={data ? data.pageable.pageNumber : 0}
        totalPages={data ? data.totalPages : 10}
        pageSize={data ? data.size : 0}
        totalelement={data ? data.totalElements : 0}
        api={true}
        name="Exchange History"
      />
    );
}

export default Exchange;
