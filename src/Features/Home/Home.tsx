"use client";

import type React from "react";

import {
  ShoppingCart,
  ShoppingBag,
  Users,
  Shirt,
  User,
  UserRoundPlus,
} from "lucide-react";
import { useState } from "react";
import { BASE_URL } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { useFetch } from "@/customHooks/useFetch";
import { BarChart1 } from "@/components/BarChart";
import { LineChart1 } from "@/components/LineChart";
import { DateFilterDialog } from "@/components/DateFilterDialog";
import EcommercePage from "@/pages/dashboard/ecommerce/page";

interface AnalyticsData {
  date: string;
  fetchedFrom: string;
  newUsers: number;
  activeUsers: number;
  fetchedAt: string;
}

interface AggregatedAnalyticsData {
  fetchedFrom: string;
  totalNewUsers: number;
  totalUsers: number;
  totalActiveUsers: number;
  fetchedAt: string;
}

interface DashboardCardProps {
  color: string;
  number: number;
  label: string;
  icon: React.ReactNode;
  loading?: boolean;
}

// Mapping of color values to Tailwind class names
const colorStyles = {
  blue: {
    border: "border-t-blue-500",
    bg: "bg-blue-100",
    icon: "text-blue-600",
    borderColor: "border-blue-300",
  },
  yellow: {
    border: "border-t-yellow-500",
    bg: "bg-yellow-100",
    icon: "text-yellow-600",
    borderColor: "border-yellow-300",
  },
  green: {
    border: "border-t-green-500",
    bg: "bg-green-100",
    icon: "text-green-500",
    borderColor: "border-green-300",
  },
  purple: {
    border: "border-t-purple-500",
    bg: "bg-purple-100",
    icon: "text-purple-600",
    borderColor: "border-purple-300",
  },
};

const DashboardCard = ({
  color,
  number,
  label,
  icon,
  loading = false,
}: DashboardCardProps) => {
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <Card className={`p-6 max-md:p-2 border border-t-4 ${styles.border}`}>
      <div className="flex max-md:flex-col max-md:items-start items-center space-x-4 max-md:gap-2 max-md:space-x-1">
        <div
          className={`p-3 max-md:p-2 ${styles.bg} rounded-full border ${styles.borderColor}`}
        >
          {icon}
        </div>
        <div>
          {loading ? (
            <>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </>
          ) : (
            <>
              <h3 className="text-2xl max-md:text-xl font-bold">{number}</h3>
              <p className="text-gray-400">{label}</p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState<{
    fromDate?: string;
    toDate?: string;
  }>({});

  // Using the custom useFetch hook for all API calls
  const {
    data: currentDayData,
    loading: currentDayLoading,
    error: currentDayError,
    refetch: refetchCurrentDay,
  } = useFetch<AnalyticsData>(`/api/analytics/user-stats`, {
    immediate: true,
  });

  const {
    data: totalData,
    loading: totalDataLoading,
    error: totalDataError,
    refetch: refetchTotalData,
  } = useFetch<AggregatedAnalyticsData>(`/api/analytics/total-user`, {
    immediate: true,
    params: dateFilter,
  });

  const {
    data: skuData,
    loading: skuLoading,
    error: skuError,
    refetch: refetchSkuData,
  } = useFetch<{ skuCount: number }>(`/api/sku-count`, {
    immediate: true,
  });

  // const {
  //   data: salesData,
  //   loading: salesLoading,
  //   error: salesError,
  //   refetch: refetchSalesData,
  // } = useFetch<{ skuCount: number }>(
  //   `/api/sales-count`,
  //   {
  //     immediate: true,
  //   }
  // );

  const handleDateFilterApply = (fromDate: string, toDate: string) => {
    const newDateFilter = { fromDate, toDate };
    setDateFilter(newDateFilter);

    // Refetch data with new date parameters
    // refetchCurrentDay(newDateFilter);
    refetchTotalData(newDateFilter);
    // SKU count might not need date filtering, but you can add it if needed
    // refetchSkuData(newDateFilter);
  };

  return (
    // <div className="p-6 max-md:pb-16 bg-white w-full space-y-6 h-fit overflow-scroll min-h-screen">
    //   <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
    //     <DashboardCard
    //       label="Total Users"
    //       color="blue"
    //       icon={<Users className="w-6 h-6 text-blue-600" />}
    //       number={totalData?.totalUsers || 0}
    //       loading={totalDataLoading}
    //     />

    //     <DashboardCard
    //       label="Active Users"
    //       color="green"
    //       icon={<UserRoundPlus className="text-green-500" />}
    //       number={currentDayData?.activeUsers || 0}
    //       loading={currentDayLoading}
    //     />

    //     <DashboardCard
    //       label="New Users"
    //       color="purple"
    //       icon={<User className="w-6 h-6 text-purple-600" />}
    //       number={currentDayData?.newUsers || 0}
    //       loading={currentDayLoading}
    //     />

    //     <DashboardCard
    //       label="Total Skus"
    //       color="yellow"
    //       icon={<Shirt className="w-6 h-6 text-yellow-600" />}
    //       number={skuData?.skuCount || 0}
    //       loading={skuLoading}
    //     />
    //   </div>

    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //     <BarChart1 dateFilter={dateFilter} />

    // {/* <LineChart1 />  */}
    //   </div>

    //   {/* Date Filter Dialog */}
    //   <DateFilterDialog onApplyFilter={handleDateFilterApply} />
    // </div>
    <EcommercePage />
  );
}
