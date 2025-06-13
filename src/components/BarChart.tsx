"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { BASE_URL } from "@/lib/constants";
import { useFetch } from "@/customHooks/useFetch";
import { useEffect } from "react";

interface UserStats {
  id: number;
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
}

interface BarChart1Props {
  dateFilter?: { fromDate?: string; toDate?: string };
}

const chartConfig = {
  desktop: {
    label: "New Users",
    color: "#1d4ed8",
  },
};

export function BarChart1({ dateFilter = {} }: BarChart1Props) {
  const { data, loading, error, refetch } = useFetch<UserStats[]>(
    `/api/analytics/fetch`,
    {
      immediate: true,
      params: dateFilter,
    }
  );

  // // Refetch when date filter changes
  // useEffect(() => {
  //   if (Object.keys(dateFilter).length > 0) {
  //     refetch(dateFilter);
  //   }
  // }, [dateFilter, refetch]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bar Chart - New Users</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bar Chart - New Users</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Active Users</CardTitle>
        <CardDescription>
          {dateFilter.fromDate && dateFilter.toDate
            ? `${formatDate(dateFilter.fromDate)} - ${formatDate(
                dateFilter.toDate
              )}`
            : "Recent data"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data || []}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatDate}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="activeUsers" fill="var(--color-desktop)" radius={2}>
              <LabelList
                position="top"
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
