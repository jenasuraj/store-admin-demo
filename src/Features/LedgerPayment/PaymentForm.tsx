import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Upload,
  Loader2,
  MapPin,
  Phone,
  Trash2,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomers } from '@/app/customerSlice';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import axios from 'axios';
import { BASE_URL } from '@/lib/constants';

// --- New Imports for Validation & Scroll ---
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInView } from 'react-intersection-observer';

// --- Types ---

interface LedgerSummaryItem {
  month: string; // "2025-12-01"
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  discountAmount?: number;
  status: "PENDING" | "PAID" | "PARTIAL";
  entries: number;
}

interface LedgerStats {
  totalLedgerAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalEntries: number;
  discountAmount?: number;
}

// --- Zod Schema ---
const paymentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  discount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Discount amount must be a positive number",
  }).optional(),
  paymentMode: z.enum(["CASH", "UPI", "BANK", "CHEQUE"]),
  date: z.date({ required_error: "Date is required" }),
  description: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// --- Components ---

// Circular Progress Component for Image Upload
function CircularProgress({ value }: { value: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-10 w-10 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="20" cy="20" r={radius} stroke="#e5e7eb" strokeWidth="4" fill="transparent" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="#22c55e"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-green-700">{Math.round(value)}%</span>
    </div>
  );
}

function CustomerCombobox({
  customers,
  value,
  onChange
}: {
  customers: any[],
  value: string,
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false);
  const selectedCustomer = customers.find(c => (c.id || c.customerId).toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white h-10"
        >
          {selectedCustomer ? `${selectedCustomer.firstname} ${selectedCustomer.lastname || ''}` : "Select customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search customer..." />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => {
                const id = (customer.id || customer.customerId).toString();
                return (
                  <CommandItem
                    key={id}
                    value={`${customer.firstname} ${customer.lastname || ''}`}
                    onSelect={() => {
                      onChange(id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {customer.firstname} {customer.lastname}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { customers } = useAppSelector((state) => state.customer);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting }
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customerId: "",
      amount: "",
      discount: "",
      paymentMode: "CASH",
      date: new Date(),
      description: ""
    }
  });

  const selectedCustomerId = watch('customerId');

  // --- Data States ---
  const [summaryList, setSummaryList] = useState<LedgerSummaryItem[]>([]);
  const [stats, setStats] = useState<LedgerStats | null>(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Infinite Scroll Hook
  const { ref, inView } = useInView();

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // --- Init ---
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // --- API Functions ---

  const fetchStats = async (custId: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/payments/ledger-stats?customerId=${custId}`);
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchSummary = useCallback(async (custId: string, pageNum: number, isNewRequest: boolean) => {
    if (!custId) return;
    setIsLoadingList(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/payments/ledgerSummary/${custId}`, {
        params: { page: pageNum, size: 20, sort: 'month,desc' }
      });

      const content = res.data.summary?.content || [];
      const isLast = res.data.summary?.last ?? true;

      setSummaryList(prev => isNewRequest ? content : [...prev, ...content]);
      setHasMore(!isLast);
    } catch (error) {
      console.error("Failed to fetch summary", error);
      toast.error("Could not load history");
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // --- Effects ---

  // 1. On Customer Change: Reset and Load Initial Data
  useEffect(() => {
    if (selectedCustomerId) {
      setPage(0);
      setSummaryList([]);
      setHasMore(true);
      setStats(null);
      fetchSummary(selectedCustomerId, 0, true);
      fetchStats(selectedCustomerId);
    } else {
      setSummaryList([]);
      setStats(null);
    }
  }, [selectedCustomerId, fetchSummary]);

  // 2. Infinite Scroll: Load More
  useEffect(() => {
    if (inView && hasMore && !isLoadingList && selectedCustomerId) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSummary(selectedCustomerId, nextPage, false);
    }
  }, [inView, hasMore, isLoadingList, selectedCustomerId, page, fetchSummary]);

  // 3. Refresh Handler
  const handleRefresh = async () => {
    if (!selectedCustomerId) return;
    setIsRefreshing(true);
    setPage(0);
    // Parallel fetch
    await Promise.all([
      fetchSummary(selectedCustomerId, 0, true),
      fetchStats(selectedCustomerId)
    ]);
    setIsRefreshing(false);
    toast.success("Data updated");
  };

  // --- Image Handling ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB Limit
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const uploadPaymentProofWithProgress = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Using Axios to track upload progress
    const response = await axios.post(`${BASE_URL}/api/user/upload?folder=payments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      }
    });
    return response.data.url;
  };

  // --- Form Submission ---

  const onSubmit = async (data: PaymentFormValues) => {
    setIsUploading(true);
    try {
      let imageUrl = "";

      if (imageFile) {
        try {
          imageUrl = await uploadPaymentProofWithProgress(imageFile);
        } catch (error) {
          toast.error("Image upload failed. Please try again.");
          setIsUploading(false);
          return;
        }
      }

      const payload = {
        amount: parseFloat(data.amount),
        discount: data.discount ? parseFloat(data.discount) : 0,
        paymentMode: data.paymentMode,
        description: data.description || "",
        imgUrl: imageUrl,
        date: format(data.date, 'yyyy-MM-dd')
      };

      await axios.post(`${BASE_URL}/api/payments/${data.customerId}/payments`, payload);

      toast.success(`Payment of ₹${payload.amount} recorded!`);

      // Cleanup
      removeImage();
      reset({
        customerId: data.customerId, // Keep customer selected
        amount: "",
        discount: "",
        paymentMode: "CASH",
        date: new Date(),
        description: ""
      });

      // Refresh Data
      handleRefresh();

    } catch (error) {
      console.error(error);
      toast.error("Failed to record payment");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const selectedCustomerDetails = customers.find(c => (c.id || c.customerId).toString() === selectedCustomerId);

  const summary = stats ? {
    progress: stats.totalLedgerAmount > 0 ? Math.round((stats.totalPaidAmount / stats.totalLedgerAmount) * 100) : 0,
    address: selectedCustomerDetails ? (selectedCustomerDetails.address || "No Address") : "",
    phone: selectedCustomerDetails ? (selectedCustomerDetails.number || "No Phone") : "",
    monthlyStats: summaryList,
    totalDue: stats.totalLedgerAmount,
    totalPaid: stats.totalPaidAmount,
    remaining: stats.totalPendingAmount,
    discount: stats.discountAmount || 0
  } : null;

  return (
    <main className="min-h-screen bg-gray-50/50 font-sans p-4">
      <div className="mx-auto space-y-6">

        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Record Payment</h1>
              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 rounded-sm px-2 font-normal">
                New Transaction
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Process payments and settle customer balances
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!selectedCustomerId || isRefreshing}
              className="gap-2 bg-white"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Refreshing..." : "Refresh Balance"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* --- LEFT COLUMN (Customer & Month Summary) --- */}
          <div className="lg:col-span-2 space-y-6 flex flex-col min-h-[calc(100vh)]">

            {/* Customer Selector Card */}
            <Card className="shadow-sm  flex-shrink-0">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">

                  <div className="flex justify-between items-start">
                    <div className="space-y-1 w-full max-w-sm">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Select Customer</Label>
                      <Controller
                        name="customerId"
                        control={control}
                        render={({ field }) => (
                          <CustomerCombobox
                            customers={customers}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      {errors.customerId && <span className="text-xs text-red-500">{errors.customerId.message}</span>}
                    </div>

                    {selectedCustomerId && stats && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Total Pending</p>
                        <p className="text-xl font-bold text-red-600">₹{stats.totalPendingAmount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {selectedCustomerId && stats && selectedCustomerDetails && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                          <span>Payment Progress</span>
                          <span>{summary.progress}% Collected</span>
                        </div>
                        <Progress value={summary.progress} className="h-2 bg-gray-100" />
                      </div>

                      <div className="flex justify-between flex-col sm:flex-row  gap-4 text-sm mt-2 pt-4 border-t">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{summary.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{summary.phone}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Month-wise Summary Table - Sticky Header & Footer Implementation */}
            <Card className="shadow-sm flex flex-col flex-grow overflow-hidden h-[50vh] border">
              <CardHeader className="pb-2 flex-shrink-0 bg-white z-20">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  Monthly Summary
                </CardTitle>
                <CardDescription>Breakdown of entries, billed amount and pending dues per month.</CardDescription>
              </CardHeader>

              <CardContent className="p-0 flex flex-col flex-grow overflow-hidden relative">
                {selectedCustomerId ? (
                  <div className="flex flex-col min-h-full">
                    {/* Header is sticky via standard table layout, Body is scrollable */}
                    <div className="overflow-y-auto flex-grow relative">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-muted-foreground uppercase bg-gray-50/95 border-b sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-6 py-3 font-medium bg-gray-50">Month</th>
                            <th className="px-6 py-3 font-medium text-center bg-gray-50">Entries</th>
                            <th className="px-6 py-3 font-medium text-right bg-gray-50">Total Billed</th>
                            <th className="px-6 py-3 font-medium text-right bg-gray-50">Paid</th>
                            <th className="px-6 py-3 font-medium text-right bg-gray-50">Discount</th>
                            <th className="px-6 py-3 font-medium text-right bg-gray-50">Pending</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {summaryList.map((stat, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {format(parseISO(stat.month), 'MMM yyyy')}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600">
                                  {stat.entries}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right font-medium">₹{stat.totalAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right text-green-600">₹{stat.paidAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right text-blue-600">₹{stat.discountAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">
                                {stat.pendingAmount !== 0 ? (
                                  <span className={cn("font-bold", stat.pendingAmount > 0 ? "text-red-600" : "text-green-600")}>
                                    ₹{stat.pendingAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">₹0</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {/* Sentinel for Infinite Scroll */}
                          {hasMore && (
                            <tr ref={ref}>
                              <td colSpan={5} className="py-4 text-center text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Sticky Footer (Stats Row) */}
                    {stats && (
                      <div className="bg-gray-900 text-white z-20 flex-shrink-0">
                        <table className="w-full text-sm text-left">
                          <tfoot>
                            <tr>
                              <td className="px-6 py-3 font-medium w-[25%]">Grand Total</td>
                              <td className="px-6 py-3 text-center font-medium w-[15%]">
                                {stats.totalEntries}
                              </td>
                              <td className="px-6 py-3 text-right font-bold w-[20%]">₹{stats.totalLedgerAmount.toLocaleString()}</td>
                              <td className="px-6 py-3 text-right font-bold text-green-400 w-[20%]">₹{stats.totalPaidAmount.toLocaleString()}</td>
                              <td className="px-6 py-3 text-right font-bold text-red-400 w-[20%]">₹{stats.totalPendingAmount.toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2 h-full">
                    <AlertCircle className="h-8 w-8 text-gray-200" />
                    Select a customer to view monthly history.
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* --- RIGHT COLUMN (Payment Form) --- */}
          <div className="lg:col-span-1 space-y-6">

            <Card className="shadow-md overflow-hidden h-fit flex flex-col sticky top-4">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Payment Details</CardTitle>
                    <CardDescription className="text-xs">Enter payment info below</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1 space-y-6">

                {/* Financial Summary Box */}
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-dashed">
                  <div className="flex justify-between text-sm">
                    <span>Total Due</span>
                    <span className="font-medium">₹{stats?.totalLedgerAmount.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Paid</span>
                    <span className="font-medium text-green-600">-₹{stats?.totalPaidAmount.toLocaleString() || '0'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Outstanding</span>
                    <span className="text-red-600">₹{stats?.totalPendingAmount.toLocaleString() || '0'}</span>
                  </div>
                </div>

                {/* Inputs */}
                <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full pl-3 text-left font-normal h-9 text-xs", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "dd MMM yyyy") : <span>Pick date</span>}
                                <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                      {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Mode</Label>
                      <Controller
                        name="paymentMode"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="BANK">Bank Transfer</SelectItem>
                              <SelectItem value="CHEQUE">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Paying Amount (₹)</Label>
                      <Input
                        max={stats?.totalPendingAmount}
                        step={"any"}
                        type="number"
                        className="font-bold text-lg h-10 border-blue-200 focus-visible:ring-blue-500"
                        placeholder="0.00"
                        {...register("amount")}
                      />
                      {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Discount Amount (₹)</Label>
                      <Input
                        step={"any"}
                        max={stats?.totalPendingAmount && stats.totalPendingAmount - (Number(watch('amount')) || 0)}
                        type="number"
                        className="font-bold text-lg h-10 border-blue-200 focus-visible:ring-blue-500"
                        placeholder="0.00"
                        {...register("discount")}
                      />
                      {errors.discount && <p className="text-xs text-red-500">{errors.discount.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      className="resize-none h-16 text-xs"
                      placeholder="Transaction ID / Notes..."
                      {...register("description")}
                    />
                  </div>
                </form>

                {/* Upload Receipt */}
                <div className="space-y-2">
                  <Label className="text-xs">Upload Receipt (Max 10MB)</Label>
                  {isUploading ? (
                    <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg p-6 flex flex-col items-center justify-center gap-3">
                      <CircularProgress value={uploadProgress} />
                      <span className="text-xs font-medium text-blue-700">Uploading... {uploadProgress}%</span>
                    </div>
                  ) : imagePreview ? (
                    <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in duration-300">
                      <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-green-800">
                        {imageFile?.name || "Receipt"}
                      </div>
                      <p className="text-xs text-green-600">Ready to upload</p>
                      <Button variant="outline" size="sm" onClick={removeImage} className="h-7 text-xs gap-1 hover:text-red-600 hover:border-red-200 bg-white">
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <Label
                      htmlFor="receipt-upload"
                      className="border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200"
                    >
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="h-5 w-5 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Click to upload receipt</span>
                      <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
                      <Input
                        id="receipt-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </Label>
                  )}
                </div>

              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  form="payment-form"
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg h-11 text-sm font-medium"
                  disabled={isFormSubmitting || isUploading || !selectedCustomerId}
                >
                  {(isFormSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isFormSubmitting || isUploading ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </div>
    </main>
  );
}