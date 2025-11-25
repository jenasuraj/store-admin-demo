// import { useEffect, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
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
//   FileText,
//   TrendingUp,
//   Wallet,
//   ArrowRight,
//   AlertCircle,
//   Eye,
//   CreditCard,
//   MapPin,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "@/app/hooks";
// import {
//   fetchLedgerEntries,
//   resetFilters,
// } from "@/app/ledgerSheetSlice";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";
// import { StorageUsageChart } from "@/components/storage-usage-chart";

// // --- Mock Stats Interface ---
// interface DashboardStats {
//   totalEntries: number;
//   totalRevenue: number;
//   totalPending: number;
//   activeCustomers: number;
//   storageAllocated: number; // Total space in bytes
//   folderUsage: { folder: string; size: number }[];
// }

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();

//   // Reuse the ledger slice for "Recent Entries"
//   const { entries, loading } = useAppSelector((state) => state.ledgerSheet);

//   // Local state for stats
//   const [stats, setStats] = useState<DashboardStats | null>(null);

//   useEffect(() => {
//     // 1. Fetch Recent Entries (Reset filters first to get true latest)
//     dispatch(resetFilters());
//     dispatch(fetchLedgerEntries());

//     // 2. Simulate fetching Dashboard Stats & Storage Data
//     setTimeout(() => {
//       setStats({
//         totalEntries: 1248,
//         totalRevenue: 845900,
//         totalPending: 125000,
//         activeCustomers: 84,
//         storageAllocated: 1045000000, // 1 GB in Bytes
//         folderUsage: [
//           { folder: "Aadhar", size: 3044000 }, // ~22MB
//           { folder: "Payments", size: 84759000 }, // ~780MB
//           { folder: "Product Images", size: 548000000 }, // ~1.5GB
//         ],
//       });
//     }, 800);
//   }, [dispatch]);

//   return (
//     <main className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
//       <div className="max-w-[1600px] mx-auto space-y-8">
//         {/* --- Header --- */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight text-gray-900">
//               Dashboard
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Overview of your business performance and usage.
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               onClick={() => navigate("/ledger/payments")}
//               className="bg-white text-gray-700 shadow-sm hover:bg-gray-50 border-gray-200"
//             >
//               <CreditCard className="ml-2 h-4 w-4 mr-2" /> Settle Payments
//             </Button>
//             <Button
//               onClick={() => navigate("/ledger/create")}
//               className="bg-gray-900 text-white shadow-sm hover:bg-gray-800"
//             >
//               New Entry <ArrowUpRight className="ml-2 h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* --- Stats & Storage Grid --- */}
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
//           {/* Key Metrics Column (Spans 3 columns on large screens) */}
//           <div className="lg:col-span-3 grid gap-4 md:grid-cols-3">
//             {/* Total Entries */}
//             <Card className="border-none shadow-sm ring-1 ring-gray-200">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Entries
//                 </CardTitle>
//                 <FileText className="h-4 w-4 text-gray-500" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-gray-900">
//                   {stats?.totalEntries.toLocaleString() || "-"}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1 flex items-center">
//                   <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
//                   <span className="text-green-600 font-medium">+12%</span>
//                   <span className="ml-1">from last month</span>
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Total Revenue */}
//             <Card className="border-none shadow-sm ring-1 ring-gray-200">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Revenue
//                 </CardTitle>
//                 <Wallet className="h-4 w-4 text-gray-500" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-gray-900">
//                   ₹{stats?.totalRevenue.toLocaleString() || "-"}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Lifetime ledger value
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Pending Amount */}
//             <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-red-50/40">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium text-red-700">
//                   Pending Due
//                 </CardTitle>
//                 <AlertCircle className="h-4 w-4 text-red-600" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-red-700">
//                   ₹{stats?.totalPending.toLocaleString() || "-"}
//                 </div>
//                 <p className="text-xs text-red-600/80 mt-1 font-medium">
//                   Action required
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

       

//           {/* --- Recent Transactions Table (Spans 3 columns to fit under metrics) --- */}
//           <Card className="lg:col-span-3  shadow-md h-full">
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg font-semibold">
//                   Recent Transactions
//                 </CardTitle>
//                 <CardDescription>Latest ledger entries.</CardDescription>
//               </div>
        
//             </CardHeader>
//             <CardContent className="grid lg:grid-cols-3 gap-4">
//               <div className="overflow-x-auto rounded-md border lg:col-span-2 shadow-md">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-gray-50 hover:bg-gray-50">
//                       <TableHead className="w-[120px]">Date</TableHead>
//                       <TableHead className="min-w-[150px]">Customer</TableHead>
//                       <TableHead className="min-w-[150px]">Product</TableHead>
//                       <TableHead className="text-center w-[100px]">Size</TableHead>
//                       <TableHead className="min-w-[120px]">Location</TableHead>
//                       <TableHead className="text-center w-[60px]">Img</TableHead>
//                       <TableHead className="text-center">Amount</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {loading
//                       ? [...Array(5)].map((_, i) => (
//                           <TableRow key={i}>
//                             <TableCell colSpan={8} className="h-12">
//                               <div className="h-4 w-full bg-gray-100 animate-pulse rounded"></div>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       : entries.slice(0, 6).map((entry) => (
//                           <TableRow
//                             key={`${entry.ledgerId}-${entry.itemId}`}
//                             className="hover:bg-gray-50/50 cursor-pointer"
//                             onClick={() => navigate("/ledger-sheet")}
//                           >
//                             <TableCell className="text-sm text-gray-600">
//                               {entry.date
//                                 ? format(new Date(entry.date), "dd MMM")
//                                 : "-"}
//                             </TableCell>
//                             <TableCell className="font-medium text-gray-900">
//                               {entry.customerName}
//                             </TableCell>
//                             <TableCell className="text-sm text-gray-600">
//                               <div className="font-medium text-gray-700">
//                                 {entry.productName}
//                               </div>
//                               <div className="text-[10px] text-muted-foreground">
//                                 SKU: {entry.productId}
//                               </div>
//                             </TableCell>
//                             <TableCell className="text-center text-xs text-gray-500">
//                               {entry.width} x {entry.height}
//                             </TableCell>
//                             <TableCell className="text-sm text-gray-500">
//                               <div className="flex items-center gap-1">
//                                 {entry.location && (
//                                   <MapPin className="h-3 w-3 text-gray-400" />
//                                 )}
//                                 <span className="truncate max-w-[100px]">
//                                   {entry.location || "-"}
//                                 </span>
//                               </div>
//                             </TableCell>
//                             <TableCell className="text-center">
//                               {entry.imageUrl ? (
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   className="h-6 w-6 text-blue-500 hover:bg-blue-50"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     window.open(entry.imageUrl, "_blank");
//                                   }}
//                                 >
//                                   <Eye className="h-3.5 w-3.5" />
//                                 </Button>
//                               ) : (
//                                 <span className="text-gray-300">-</span>
//                               )}
//                             </TableCell>
//                             <TableCell className="text-center font-bold text-gray-900">
//                               ₹{entry?.amount.toLocaleString() || "0"}
//                             </TableCell>
//                           </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//                           <Button
//                 variant="ghost"
//                 size="sm"
//                 className="gap-2 w-full rounded-none text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//                 onClick={() => navigate("/ledger-sheet")}
//               >
//                 View Full List <ArrowRight className="h-4 w-4" />
//               </Button>
                
//               </div>
//                  {/* Storage Chart Column (Spans 1 column) */}
//           <div className="lg:col-span-1 lg:row-span-1 h-full">
//             {stats && (
//               <StorageUsageChart
//                 data={stats.folderUsage}
//                 totalAllocated={stats.storageAllocated}
//               />
//             )}
//           </div>
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
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchLedgerEntries,
  resetFilters,
} from "@/app/ledgerSheetSlice";
import { format } from "date-fns";
import { StorageUsageChart } from "@/components/storage-usage-chart";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

// --- API Response Interfaces ---

interface LedgerStatsResponse {
  totalLedgerAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalEntries: number;
}

interface StorageFolder {
  folder: string;
  bytes: number;
}

interface StorageUsageResponse {
  containerTotalBytes: number;
  quotaLimitBytes: number;
  remaining: number;
  folders: StorageFolder[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux: Recent Entries & User Info
  const { entries, loading: tableLoading } = useAppSelector((state) => state.ledgerSheet);
  const user = useAppSelector((state) => state.user); // Accessing user to get groupCompanyId

  // Local State for Stats
  const [ledgerStats, setLedgerStats] = useState<LedgerStatsResponse | null>(null);
  const [storageStats, setStorageStats] = useState<StorageUsageResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Recent Entries (Existing Logic)
    dispatch(resetFilters());
    dispatch(fetchLedgerEntries());

    // 2. Fetch Dashboard Stats & Storage
    const fetchDashboardStats = async () => {
      setStatsLoading(true);
      try {
        // Prepare promises
        const ledgerPromise = axios.get(`${BASE_URL}/api/payments/ledger-stats`);
        
        // Only fetch storage if we have a groupCompanyId
        const storagePromise = user?.user.groupCompanyId 
          ? axios.get(`${BASE_URL}/api/quota/usage/${user.user.groupCompanyId}`)
          : Promise.resolve({ data: null });

        const [ledgerRes, storageRes] = await Promise.all([ledgerPromise, storagePromise]);

        setLedgerStats(ledgerRes.data);
        if (storageRes.data) {
          setStorageStats(storageRes.data);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [dispatch, user?.user.groupCompanyId]);

  // Transform storage data for the chart component
  const chartData = storageStats?.folders.map(f => ({
    folder: f.folder.replace('/', ''), // Clean up folder name (remove trailing slash)
    size: f.bytes
  })) || [];

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
              onClick={() => navigate("/ledger/add")}
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
                {statsLoading ? (
                   <div className="h-8 w-24 bg-gray-100 animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    {ledgerStats?.totalEntries.toLocaleString() || "0"}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">Recorded</span>
                  <span className="ml-1">transactions</span>
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue (Ledger Amount) */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Billed
                </CardTitle>
                <Wallet className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                 {statsLoading ? (
                   <div className="h-8 w-32 bg-gray-100 animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{ledgerStats?.totalLedgerAmount.toLocaleString() || "0"}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                   <CheckCircle2 className="h-3 w-3 text-green-600"/>
                   Paid: <span className="text-green-600 font-medium">₹{ledgerStats?.totalPaidAmount.toLocaleString() || "0"}</span>
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
                 {statsLoading ? (
                   <div className="h-8 w-32 bg-red-100/50 animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold text-red-700">
                    ₹{ledgerStats?.totalPendingAmount.toLocaleString() || "0"}
                  </div>
                )}
                <p className="text-xs text-red-600/80 mt-1 font-medium">
                  Outstanding Balance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* --- Recent Transactions Table (Spans 3 columns to fit under metrics) --- */}
          <Card className="lg:col-span-3 shadow-md h-full">
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
                    {tableLoading
                      ? [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={8} className="h-12">
                              <div className="h-4 w-full bg-gray-100 animate-pulse rounded"></div>
                            </TableCell>
                          </TableRow>
                        ))
                      : entries.slice(0, 9).map((entry) => (
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
                {storageStats ? (
                  <StorageUsageChart
                    data={chartData}
                    totalAllocated={storageStats.quotaLimitBytes}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-white border rounded-lg p-6">
                      {statsLoading ? <div className="h-32 w-32 bg-gray-100 rounded-full animate-pulse"></div> : <p className="text-sm text-muted-foreground">Storage info unavailable</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}