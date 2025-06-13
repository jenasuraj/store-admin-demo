import React, { useEffect, useState } from "react";
import { columns, columnsForPaymentFailed } from "./column";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchOrderAsync,
  fetchPaymentFailedAsync,
  selectOrderEntity,
  selectOrderError,
  selectOrderLoading,
} from "@/app/OrderSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShadcnTable from "@/components/newShadcnTable/ShadcnTable";

function NewOrder() {
  const dispatch = useAppDispatch();
  const params = useLocation().search;
  const sort = params.split("?")[1];
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const data = useAppSelector(selectOrderEntity);
  const loading = useAppSelector(selectOrderLoading);
  const error = useAppSelector(selectOrderError);
  const query = new URLSearchParams(params);
  const urlStatus = query.get("status");

  useEffect(() => {
    if (urlStatus) {
      setStatus(urlStatus);
    } else if (status == "PAYMENT_FAILED") {
      setStatus("PAYMENT_FAILED");
    } else {
      setStatus("pending");
    }
  }, [params, dispatch]);

  useEffect(() => {
    const query = new URLSearchParams(params);
    const urlStatus = query.get("status");

    if (urlStatus) {
      setStatus(urlStatus); // Keep status in sync with URL.
    } else if (status == "PAYMENT_FAILED") {
      setStatus("PAYMENT_FAILED");
      navigate("?paymentStatus=PAYMENT_FAILED", { replace: true });
    } else {
      setStatus("pending");
      navigate("?status=pending", { replace: true });
      return; // Return early to avoid dispatching with empty status.
    }

    if (status != "PAYMENT_FAILED") {
      const fetchOrders = async () => {
        try {
          await dispatch(
            fetchOrderAsync(
              params ? `${params}` : `?status=${urlStatus}&${params}`
            )
          ).unwrap();
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      };

      fetchOrders();
    } else {
      const fetchOrders = async () => {
        try {
          await dispatch(
            fetchPaymentFailedAsync(
              params ? `${params}` : `?paymentStatus=${urlStatus}&${params}`
            )
          ).unwrap();
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      };

      fetchOrders();
    }
  }, [params, dispatch, navigate]);

  return (
    <>
      <Tabs defaultValue={`${urlStatus || "pending"}`} className="w-full">
        <TabsList>
          <TabsTrigger
            value="pending"
            onClick={() => {
              setStatus("pending");
              navigate(`?status=pending`);
            }}
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="packed"
            onClick={() => {
              setStatus("packed");
              navigate(`?status=packed`);
            }}
          >
            Packed
          </TabsTrigger>
          <TabsTrigger
            value="shipped"
            onClick={() => {
              setStatus("shipped");
              navigate(`?status=shipped`);
            }}
          >
            Shipped
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            onClick={() => {
              setStatus("delivered");
              navigate(`?status=delivered`);
            }}
          >
            Delivered
          </TabsTrigger>
          <TabsTrigger
            value="PAYMENT_FAILED"
            onClick={() => {
              setStatus("PAYMENT_FAILED");
              navigate(`?paymentStatus=PAYMENT_FAILED`);
            }}
          >
            Payment Failed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <ShadcnTable
            name="Pending Order History"
            loading={loading}
            error={error}
            data={loading ? [] : data?.content || []}
            columns={columns}
            api={true}
            currentPage={data ? data.pageable.pageNumber : 0}
            totalPages={data ? data.totalPages : 10}
            pageSize={data ? data.size : 0}
            totalelement={data ? data.totalElements : 0}
          />
        </TabsContent>
        <TabsContent value="shipped">
          <ShadcnTable
            name="Shipped Order History"
            loading={loading}
            error={error}
            data={loading ? [] : data?.content || []}
            columns={columns}
            api={true}
            currentPage={data ? data.pageable.pageNumber : 0}
            totalPages={data ? data.totalPages : 10}
            pageSize={data ? data.size : 0}
            totalelement={data ? data.totalElements : 0}
          />
        </TabsContent>
        <TabsContent value="delivered">
          <ShadcnTable
            name="Delivered Order History"
            loading={loading}
            error={error}
            data={loading ? [] : data?.content || []}
            columns={columns}
            api={true}
            currentPage={data ? data.pageable.pageNumber : 0}
            totalPages={data ? data.totalPages : 10}
            pageSize={data ? data.size : 0}
            totalelement={data ? data.totalElements : 0}
          />
        </TabsContent>
        <TabsContent value="packed">
          <ShadcnTable
            name="Packed Order History"
            loading={loading}
            error={error}
            data={loading ? [] : data?.content || []}
            columns={columns}
            api={true}
            currentPage={data ? data.pageable.pageNumber : 0}
            totalPages={data ? data.totalPages : 10}
            pageSize={data ? data.size : 0}
            totalelement={data ? data.totalElements : 0}
          />
        </TabsContent>
        <TabsContent value="PAYMENT_FAILED">
          <ShadcnTable
            name="Payment Failed"
            loading={loading}
            error={error}
            data={loading ? [] : data?.content || []}
            columns={columnsForPaymentFailed}
            api={true}
            currentPage={data ? data.pageable.pageNumber : 0}
            totalPages={data ? data.totalPages : 10}
            pageSize={data ? data.size : 0}
            totalelement={data ? data.totalElements : 0}
          />
        </TabsContent>
      </Tabs>
    </>
  );
  // else return <span>No orders</span>;
}

export default NewOrder;
