// import { useEffect, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   ArrowUpRight,
//   CreditCard,
//   Database,
//   FileText,
//   HardDrive,
//   TrendingUp,
//   Users,
//   Wallet,
//   ArrowRight,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "@/app/hooks";
// import {
//   fetchLedgerEntries,
//   setPage,
//   resetFilters,
// } from "@/app/ledgerSheetSlice";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";

// // --- Mock Stats Interface ---
// // In a real app, you would fetch this from an endpoint like /api/dashboard/stats
// interface DashboardStats {
//   totalEntries: number;
//   totalRevenue: number;
//   totalPending: number;
//   activeCustomers: number;
//   storageUsed: number; // in MB
//   storageLimit: number; // in MB
// }

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();

//   // Reuse the ledger slice for "Recent Entries"
//   const { entries, loading } = useAppSelector((state) => state.ledgerSheet);

//   // Local state for stats
//   const [stats, setStats] = useState<DashboardStats | null>(null);

//   useEffect(() => {
//     // 1. Fetch Recent 10 Entries
//     // We reset filters to ensure we get the true "latest" entries, not filtered ones
//     dispatch(resetFilters());
//     // We manually dispatch the fetch with page 0 size 10 directly here or ensure the slice defaults are set
//     // Since the slice uses state, we ideally want a separate "fetchRecent" thunk,
//     // but for now we can just use the existing one which defaults to page 0.
//     dispatch(fetchLedgerEntries());

//     // 2. Simulate fetching Dashboard Stats
//     // Replace this with an actual API call later
//     setTimeout(() => {
//       setStats({
//         totalEntries: 1248,
//         totalRevenue: 845900,
//         totalPending: 125000,
//         activeCustomers: 84,
//         storageUsed: 4500, // 4.5 GB
//         storageLimit: 10000, // 10 GB
//       });
//     }, 500);
//   }, [dispatch]);

//   // Calculate Storage Percentage
//   const storagePercent = stats
//     ? Math.round((stats.storageUsed / stats.storageLimit) * 100)
//     : 0;

//   return (
//     <main className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
//       <div className="max-w-[1600px] mx-auto space-y-8">
//         {/* --- Header --- */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-gray-900">
//               Dashboard
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Overview of your business performance and usage.
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button
//               onClick={() => navigate("/ledger/add")}
//               className="bg-gray-900 text-white shadow-sm hover:bg-gray-800"
//             >
//               New Entry <ArrowUpRight className="ml-2 h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* --- Stats Grid --- */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {/* Total Entries */}
//           <Card className="border-none shadow-sm ring-1 ring-gray-200">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Total Entries
//               </CardTitle>
//               <FileText className="h-4 w-4 text-gray-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-gray-900">
//                 {stats?.totalEntries.toLocaleString() || "-"}
//               </div>
//               <p className="text-xs text-muted-foreground mt-1 flex items-center">
//                 <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
//                 <span className="text-green-600 font-medium">+12%</span>
//                 <span className="ml-1">from last month</span>
//               </p>
//             </CardContent>
//           </Card>

//           {/* Total Revenue */}
//           <Card className="border-none shadow-sm ring-1 ring-gray-200">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Total Revenue
//               </CardTitle>
//               <Wallet className="h-4 w-4 text-gray-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-gray-900">
//                 ₹{stats?.totalRevenue.toLocaleString() || "-"}
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">
//                 Lifetime ledger value
//               </p>
//             </CardContent>
//           </Card>

//           {/* Pending Amount */}
//           <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-red-50/30">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-red-600/80">
//                 Pending Due
//               </CardTitle>
//               <AlertCircle className="h-4 w-4 text-red-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-red-600">
//                 ₹{stats?.totalPending.toLocaleString() || "-"}
//               </div>
//               <p className="text-xs text-red-600/60 mt-1">Needs attention</p>
//             </CardContent>
//           </Card>

//           {/* Storage Usage */}
//           <Card className="border-none shadow-sm ring-1 ring-gray-200">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Cloud Storage
//               </CardTitle>
//               <HardDrive className="h-4 w-4 text-gray-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="flex justify-between items-end mb-2">
//                 <div className="text-2xl font-bold text-gray-900">
//                   {(stats?.storageUsed || 0) / 1000}{" "}
//                   <span className="text-sm font-normal text-muted-foreground">
//                     GB
//                   </span>
//                 </div>
//                 <div className="text-xs text-muted-foreground mb-1">
//                   of {(stats?.storageLimit || 0) / 1000} GB Used
//                 </div>
//               </div>
//               <Progress
//                 value={storagePercent}
//                 className="h-2"
//                 //@ts-ignore
//                 indicatorClassName={cn(
//                   storagePercent > 90 ? "bg-red-500" : "bg-blue-600"
//                 )}
//               />
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* --- Recent Transactions Table --- */}
//           <Card className="lg:col-span-3 border-none shadow-md">
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg font-semibold">
//                   Recent Transactions
//                 </CardTitle>
//                 <CardDescription>Latest 10 ledger entries.</CardDescription>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//                 onClick={() => navigate("/ledger-sheet")}
//               >
//                 View Full List <ArrowRight className="h-4 w-4" />
//               </Button>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-gray-50 hover:bg-gray-50">
//                       <TableHead className="w-[100px]">Ledger ID</TableHead>
//                       <TableHead className="w-[150px]">Date</TableHead>
//                       <TableHead>Customer</TableHead>
//                       <TableHead>Items</TableHead>
//                       <TableHead className="text-center">Quantity</TableHead>
//                       <TableHead className="text-right">Amount</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {loading
//                       ? [...Array(5)].map((_, i) => (
//                           <TableRow key={i}>
//                             <TableCell>
//                               <div className="h-4 w-12 bg-gray-100 animate-pulse rounded"></div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="h-6 w-16 bg-gray-100 animate-pulse rounded mx-auto"></div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="h-4 w-20 bg-gray-100 animate-pulse rounded ml-auto"></div>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       : entries.slice(0, 10).map((entry) => (
//                           <TableRow
//                             key={entry.ledgerId}
//                             className="hover:bg-gray-50/50 cursor-pointer"
//                             onClick={() => navigate("/ledger-sheet")}
//                           >
//                             <TableCell className="font-mono text-xs text-gray-500">
//                               #{entry.ledgerId}
//                             </TableCell>
//                             <TableCell className="text-sm text-gray-600">
//                               {entry.date
//                                 ? format(new Date(entry.date), "dd MMM yyyy")
//                                 : entry.date}
//                             </TableCell>
//                             <TableCell className="font-medium text-gray-900">
//                               {entry.customerName}
//                             </TableCell>
//                             <TableCell className="text-sm text-gray-500">
//                               {entry.productName}
//                             </TableCell>
//                             <TableCell className="text-center">
//                               <Badge
//                                 variant="secondary"
//                                 className={cn(
//                                   "font-normal text-[10px] px-2 h-5",
//                                   entry.paymentStatus === "PENDING"
//                                     ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
//                                     : "bg-green-100 text-green-700 hover:bg-green-100"
//                                 )}
//                               >
//                                 {entry.quantity}
//                               </Badge>
//                             </TableCell>
//                             <TableCell className="text-right font-bold text-gray-900">
//                               ₹{entry?.amount.toLocaleString() || "0"}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </main>
//   );
// }


import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  FileText,
  TrendingUp,
  Wallet,
  ArrowRight,
  AlertCircle,
  Eye,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchLedgerEntries,
  resetFilters,
} from "@/app/ledgerSheetSlice";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { StorageUsageChart } from "@/components/storage-usage-chart";

// --- Mock Stats Interface ---
interface DashboardStats {
  totalEntries: number;
  totalRevenue: number;
  totalPending: number;
  activeCustomers: number;
  storageAllocated: number; // Total space in bytes
  folderUsage: { folder: string; size: number }[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Reuse the ledger slice for "Recent Entries"
  const { entries, loading } = useAppSelector((state) => state.ledgerSheet);

  // Local state for stats
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // 1. Fetch Recent Entries (Reset filters first to get true latest)
    dispatch(resetFilters());
    dispatch(fetchLedgerEntries());

    // 2. Simulate fetching Dashboard Stats & Storage Data
    setTimeout(() => {
      setStats({
        totalEntries: 1248,
        totalRevenue: 845900,
        totalPending: 125000,
        activeCustomers: 84,
        storageAllocated: 1045000000, // 1 GB in Bytes
        folderUsage: [
          { folder: "Aadhar", size: 3044000 }, // ~22MB
          { folder: "Payments", size: 84759000 }, // ~780MB
          { folder: "Product Images", size: 548000000 }, // ~1.5GB
        ],
      });
    }, 800);
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of your business performance and usage.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/ledger/payments")}
              className="bg-white text-gray-700 shadow-sm hover:bg-gray-50 border-gray-200"
            >
              <CreditCard className="ml-2 h-4 w-4 mr-2" /> Settle Payments
            </Button>
            <Button
              onClick={() => navigate("/ledger/create")}
              className="bg-gray-900 text-white shadow-sm hover:bg-gray-800"
            >
              New Entry <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* --- Stats & Storage Grid --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* Key Metrics Column (Spans 3 columns on large screens) */}
          <div className="lg:col-span-3 grid gap-4 md:grid-cols-3">
            {/* Total Entries */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Entries
                </CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.totalEntries.toLocaleString() || "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <Wallet className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{stats?.totalRevenue.toLocaleString() || "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime ledger value
                </p>
              </CardContent>
            </Card>

            {/* Pending Amount */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-red-50/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">
                  Pending Due
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  ₹{stats?.totalPending.toLocaleString() || "-"}
                </div>
                <p className="text-xs text-red-600/80 mt-1 font-medium">
                  Action required
                </p>
              </CardContent>
            </Card>
          </div>

       

          {/* --- Recent Transactions Table (Spans 3 columns to fit under metrics) --- */}
          <Card className="lg:col-span-3  shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest ledger entries.</CardDescription>
              </div>
        
            </CardHeader>
            <CardContent className="grid lg:grid-cols-3 gap-4">
              <div className="overflow-x-auto rounded-md border lg:col-span-2 shadow-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="min-w-[150px]">Customer</TableHead>
                      <TableHead className="min-w-[150px]">Product</TableHead>
                      <TableHead className="text-center w-[100px]">Size</TableHead>
                      <TableHead className="min-w-[120px]">Location</TableHead>
                      <TableHead className="text-center w-[60px]">Img</TableHead>
                      <TableHead className="text-center">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={8} className="h-12">
                              <div className="h-4 w-full bg-gray-100 animate-pulse rounded"></div>
                            </TableCell>
                          </TableRow>
                        ))
                      : entries.slice(0, 6).map((entry) => (
                          <TableRow
                            key={`${entry.ledgerId}-${entry.itemId}`}
                            className="hover:bg-gray-50/50 cursor-pointer"
                            onClick={() => navigate("/ledger-sheet")}
                          >
                            <TableCell className="text-sm text-gray-600">
                              {entry.date
                                ? format(new Date(entry.date), "dd MMM")
                                : "-"}
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                              {entry.customerName}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              <div className="font-medium text-gray-700">
                                {entry.productName}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                SKU: {entry.productId}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs text-gray-500">
                              {entry.width} x {entry.height}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                {entry.location && (
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                )}
                                <span className="truncate max-w-[100px]">
                                  {entry.location || "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {entry.imageUrl ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-blue-500 hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(entry.imageUrl, "_blank");
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-bold text-gray-900">
                              ₹{entry?.amount.toLocaleString() || "0"}
                            </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
                </Table>
                          <Button
                variant="ghost"
                size="sm"
                className="gap-2 w-full rounded-none text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => navigate("/ledger-sheet")}
              >
                View Full List <ArrowRight className="h-4 w-4" />
              </Button>
                
              </div>
                 {/* Storage Chart Column (Spans 1 column) */}
          <div className="lg:col-span-1 lg:row-span-1 h-full">
            {stats && (
              <StorageUsageChart
                data={stats.folderUsage}
                totalAllocated={stats.storageAllocated}
              />
            )}
          </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}