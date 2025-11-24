// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList
// } from '@/components/ui/command';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import {
//   Calendar as CalendarIcon,
//   Check,
//   ChevronsUpDown,
//   Upload,
//   X,
//   Loader2,
//   CreditCard,
//   ArrowLeft,
//   MapPin,
//   Mail,
//   Phone,
//   Printer,
//   Download,
//   FileText,
//   Trash2
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '@/app/hooks';
// import { fetchCustomers } from '@/app/customerSlice';
// import { cn } from '@/lib/utils';
// import { format } from 'date-fns';
// import { Calendar } from '@/components/ui/calendar';
// import { toast } from 'sonner';
// import axios from 'axios';
// import { BASE_URL } from '@/lib/constants';

// // --- Types ---

// interface MockLedgerItem {
//   id: number;
//   name: string;
//   desc: string;
//   qty: number;
//   rate: number;
//   amount: number;
// }

// interface FinancialSummary {
//   totalDue: number;
//   totalPaid: number;
//   remaining: number;
//   // Mock data for UI visualization
//   items: MockLedgerItem[];
//   address: string;
//   progress: number;
// }

// // --- API Helper (Image Upload) ---
// const uploadPaymentProof = async (file: File): Promise<string> => {
//   const formData = new FormData();
//   formData.append('file', file);
//   const response = await axios.post(`${BASE_URL}/api/user/upload?folder=payments`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   });
//   return response.data.url;
// };

// // --- Components ---

// function CustomerCombobox({
//   customers,
//   value,
//   onChange
// }: {
//   customers: any[],
//   value: string,
//   onChange: (id: string) => void
// }) {
//   const [open, setOpen] = useState(false);
//   const selectedCustomer = customers.find(c => (c.id || c.customerId).toString() === value);

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className="w-full justify-between bg-white h-10"
//         >
//           {selectedCustomer ? `${selectedCustomer.firstname} ${selectedCustomer.lastname || ''}` : "Select customer..."}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[300px] p-0">
//         <Command>
//           <CommandInput placeholder="Search customer..." />
//           <CommandList>
//             <CommandEmpty>No customer found.</CommandEmpty>
//             <CommandGroup>
//               {customers.map((customer) => {
//                  const id = (customer.id || customer.customerId).toString();
//                  return (
//                   <CommandItem
//                     key={id}
//                     value={`${customer.firstname} ${customer.lastname || ''}`}
//                     onSelect={() => {
//                       onChange(id);
//                       setOpen(false);
//                     }}
//                   >
//                     <Check
//                       className={cn(
//                         "mr-2 h-4 w-4",
//                         value === id ? "opacity-100" : "opacity-0"
//                       )}
//                     />
//                     {customer.firstname} {customer.lastname}
//                   </CommandItem>
//                 );
//               })}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

// export default function PaymentPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const { customers } = useAppSelector((state) => state.customer);

//   // --- Form State ---
//   const [customerId, setCustomerId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [paymentMode, setPaymentMode] = useState('CASH');
//   const [date, setDate] = useState<Date>(new Date());
//   const [description, setDescription] = useState('');
  
//   // Image State
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);

//   // Mock Data State
//   const [summary, setSummary] = useState<FinancialSummary | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // --- Init ---
//   useEffect(() => {
//     dispatch(fetchCustomers());
//   }, [dispatch]);

//   // --- Effects: Generate Mock Data on Selection ---
//   useEffect(() => {
//     if (customerId) {
//       // Generating dynamic mock data for the UI
//       const mockTotal = Math.floor(Math.random() * 50000) + 20000;
//       const mockPaid = Math.floor(Math.random() * 15000);
      
//       // Generate some mock items to populate the "Product" table
//       const items: MockLedgerItem[] = [
//         { id: 1, name: "LED Standee 5x4", desc: "Warehouse A", qty: 2, rate: 5000, amount: 10000 },
//         { id: 2, name: "Vinyl Print", desc: "Immediate Delivery", qty: 100, rate: 150, amount: 15000 },
//         { id: 3, name: "Acrylic Frame", desc: "Pending Install", qty: 5, rate: 2000, amount: 10000 },
//       ];
      
//       const calcTotal = items.reduce((acc, item) => acc + item.amount, 0);
//       const remaining = calcTotal - mockPaid;

//       setSummary({
//         totalDue: calcTotal,
//         totalPaid: mockPaid,
//         remaining: remaining,
//         items: items,
//         address: "Gala No. 4, Industrial Estate, Lower Parel, Mumbai - 400013",
//         progress: Math.min(100, Math.round((mockPaid / calcTotal) * 100))
//       });
      
//       // Auto-fill amount with remaining (user can edit)
//       setAmount(remaining.toString());
//     } else {
//       setSummary(null);
//       setAmount('');
//     }
//   }, [customerId]);

//   // --- Handlers ---

//   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const removeImage = () => {
//     setImageFile(null);
//     setImagePreview(null);
//   };

//   const handleSubmit = async () => {
//     if (!customerId) return toast.error("Please select a customer");
//     if (!amount) return toast.error("Please enter an amount");

//     setIsSubmitting(true);

//     try {
//       let imageUrl = "";
//       if (imageFile) {
//         setIsUploading(true);
//         try {
//           imageUrl = await uploadPaymentProof(imageFile);
//         } catch (error) {
//           toast.error("Failed to upload proof image.");
//         } finally {
//           setIsUploading(false);
//         }
//       }

//       const payload = {
//         customerId: parseInt(customerId),
//         amount: parseFloat(amount),
//         paymentMode,
//         transactionDate: format(date, 'yyyy-MM-dd'),
//         description,
//         proofUrl: imageUrl
//       };

//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       toast.success(`Payment of ₹${payload.amount} recorded successfully!`);
//       navigate('/ledger-sheet');

//     } catch (error) {
//       toast.error("Failed to record payment");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const selectedCustomerData = customers.find(c => (c.id || c.customerId).toString() === customerId);

//   return (
//     <main className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
//       <div className="max-w-[1400px] mx-auto space-y-6">
        
//         {/* --- Header Section --- */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             {/* <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
//               <ArrowLeft className="h-4 w-4" />
//             </Button> */}
//             <div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-xl font-bold tracking-tight text-foreground">PAYMENT-REC-{new Date().getFullYear()}-00X</h1>
//                 <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-sm px-2 font-normal">
//                   ACTIVE
//                 </Badge>
//               </div>
//               <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
//                 <span>Date: {format(new Date(), 'dd MMM yyyy')}</span> | <span>Cashier: Admin</span>
//               </p>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline" size="sm" className="gap-2 bg-white">
//               <Download className="h-4 w-4" /> Export
//             </Button>
//             <Button variant="default" size="sm" className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
//               <Printer className="h-4 w-4" /> Print
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* --- LEFT COLUMN (Customer & Items) --- */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Customer Details Card */}
//             <Card className="border-none shadow-sm">
//               <CardContent className="p-6">
//                 <div className="flex flex-col gap-6">
                  
//                   {/* Selector Header */}
//                   <div className="flex justify-between items-start">
//                     <div className="space-y-1 w-full max-w-xs">
//                       <Label className="text-xs text-muted-foreground uppercase tracking-wider">Select Customer</Label>
//                       <CustomerCombobox
//                         customers={customers}
//                         value={customerId}
//                         onChange={setCustomerId}
//                       />
//                     </div>
//                     {customerId && (
//                       <div className="flex gap-2">
//                         <Button variant="outline" size="sm" className="gap-2 text-xs">
//                           <Mail className="h-3.5 w-3.5" /> Send Email
//                         </Button>
//                         <Button variant="outline" size="sm" className="gap-2 text-xs">
//                           <Phone className="h-3.5 w-3.5" /> Call
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   {customerId && summary && (
//                     <>
//                       {/* Progress */}
//                       <div className="space-y-2">
//                         <div className="flex justify-between text-sm">
//                           <span className="font-semibold">Payment Progress</span>
//                           <span className="text-muted-foreground">{summary.progress}% Paid</span>
//                         </div>
//                         <Progress value={summary.progress} className="h-2" />
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
//                         <div className="flex items-start gap-2 text-muted-foreground">
//                           <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
//                           <span>{summary.address}</span>
//                         </div>
//                         <div className="flex items-start gap-2 text-muted-foreground">
//                           <CreditCard className="h-4 w-4 mt-0.5 shrink-0" />
//                           <span>GSTIN: 27ABCDE1234F1Z5</span>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Product / Outstanding Items Table */}
//             <Card className="border-none shadow-sm h-full">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-base font-semibold">Outstanding Items</CardTitle>
//                 <p className="text-xs text-muted-foreground">Pending ledger entries to be settled</p>
//               </CardHeader>
//               <CardContent className="p-0">
//                 {customerId && summary ? (
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm text-left">
//                       <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 border-b">
//                         <tr>
//                           <th className="px-6 py-3 font-medium">Item Detail</th>
//                           <th className="px-6 py-3 font-medium text-center">Qty</th>
//                           <th className="px-6 py-3 font-medium text-right">Rate</th>
//                           <th className="px-6 py-3 font-medium text-right">Amount</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {summary.items.map((item) => (
//                           <tr key={item.id} className="hover:bg-gray-50/50">
//                             <td className="px-6 py-4">
//                               <div className="font-medium text-gray-900">{item.name}</div>
//                               <div className="text-xs text-muted-foreground">{item.desc}</div>
//                             </td>
//                             <td className="px-6 py-4 text-center">{item.qty}</td>
//                             <td className="px-6 py-4 text-right text-muted-foreground">₹{item.rate.toLocaleString()}</td>
//                             <td className="px-6 py-4 text-right font-semibold text-gray-900">₹{item.amount.toLocaleString()}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                       <tfoot className="bg-gray-50/30">
//                         <tr>
//                           <td colSpan={3} className="px-6 py-3 text-right font-medium text-muted-foreground">Subtotal</td>
//                           <td className="px-6 py-3 text-right font-bold text-gray-900">₹{summary.totalDue.toLocaleString()}</td>
//                         </tr>
//                         <tr>
//                           <td colSpan={3} className="px-6 py-1 text-right text-xs text-muted-foreground">Tax (18%)</td>
//                           <td className="px-6 py-1 text-right text-xs text-muted-foreground">₹{(summary.totalDue * 0.18).toLocaleString()}</td>
//                         </tr>
//                         <tr>
//                           <td colSpan={3} className="px-6 py-3 text-right font-bold text-lg">Total</td>
//                           <td className="px-6 py-3 text-right font-bold text-lg text-gray-900">₹{(summary.totalDue * 1.18).toLocaleString()}</td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="p-12 text-center text-muted-foreground text-sm">
//                     Select a customer to view outstanding items.
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Bank Info Footer (Visual Only) */}
//             <Card className="border-none shadow-sm bg-blue-50/50">
//               <CardContent className="p-4 flex items-center gap-4">
//                 <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
//                   <CreditCard className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground uppercase font-bold">Payment To</p>
//                   <p className="text-sm font-semibold text-gray-900">Actify Zone Pvt Ltd • HDFC Bank • 50100234567890</p>
//                 </div>
//               </CardContent>
//             </Card>

//           </div>

//           {/* --- RIGHT COLUMN (Payment Action) --- */}
//           <div className="lg:col-span-1 space-y-6">
            
//             <Card className="border-none shadow-md overflow-hidden h-full flex flex-col">
//               <CardHeader className="bg-gray-50/50 border-b pb-4">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <CardTitle className="text-base">Payment</CardTitle>
//                     <CardDescription className="text-xs">Complete payment to settle balance.</CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
              
//               <CardContent className="p-6 flex-1 space-y-6">
                
//                 {/* Status & Summary */}
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-muted-foreground">Status:</span>
//                     <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none">
//                       {summary && summary.remaining === 0 ? 'FULLY PAID' : 'PARTIALLY PAID'}
//                     </Badge>
//                   </div>
                  
//                   <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-dashed">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Invoice</span>
//                       <span className="font-medium">INV-{new Date().getFullYear()}-001</span>
//                     </div>
//                     <Separator />
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Total Due</span>
//                       <span className="font-medium">₹{summary?.totalDue.toLocaleString() || '0'}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Paid</span>
//                       <span className="font-medium text-green-600">-₹{summary?.totalPaid.toLocaleString() || '0'}</span>
//                     </div>
//                     <Separator />
//                     <div className="flex justify-between text-base font-bold">
//                       <span>Outstanding</span>
//                       <span className="text-red-600">₹{summary?.remaining.toLocaleString() || '0'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Input Fields */}
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-1">
//                       <Label className="text-xs">Payment Date</Label>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <Button variant="outline" className={cn("w-full pl-3 text-left font-normal h-9 text-xs", !date && "text-muted-foreground")}>
//                             {date ? format(date, "dd MMM yyyy") : <span>Pick date</span>}
//                             <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                     <div className="space-y-1">
//                       <Label className="text-xs">Mode</Label>
//                       <Select value={paymentMode} onValueChange={setPaymentMode}>
//                         <SelectTrigger className="h-9 text-xs">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="CASH">Cash</SelectItem>
//                           <SelectItem value="UPI">UPI</SelectItem>
//                           <SelectItem value="BANK">Bank Transfer</SelectItem>
//                           <SelectItem value="CHEQUE">Cheque</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs">Paying Amount (₹)</Label>
//                     <Input
//                       type="number"
//                       className="font-bold text-lg h-10"
//                       placeholder="0.00"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs">Description</Label>
//                     <Textarea
//                       className="resize-none h-16 text-xs"
//                       placeholder="Transaction ID / Notes..."
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {/* Upload Receipt - Styled like Reference */}
//                 <div className="space-y-2">
//                   <Label className="text-xs">Upload Receipt</Label>
//                   {imagePreview ? (
//                     <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in duration-300">
//                       <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
//                         <Check className="h-5 w-5 text-white" />
//                       </div>
//                       <div className="text-sm font-medium text-green-800">
//                         {imageFile?.name || "Receipt.jpg"}
//                       </div>
//                       <p className="text-xs text-green-600">Upload complete</p>
//                       <Button variant="outline" size="sm" onClick={removeImage} className="h-7 text-xs gap-1 hover:text-red-600 hover:border-red-200">
//                         <Trash2 className="h-3 w-3" /> Delete File
//                       </Button>
//                     </div>
//                   ) : (
//                     <Label
//                       htmlFor="receipt-upload"
//                       className="border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200"
//                     >
//                       <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
//                         <Upload className="h-5 w-5 text-gray-500" />
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">Click to upload receipt</span>
//                       <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
//                       <Input
//                         id="receipt-upload"
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         onChange={handleFileSelect}
//                       />
//                     </Label>
//                   )}
//                 </div>

//               </CardContent>

//               <CardFooter className="p-6 pt-0">
//                 <Button
//                   className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
//                   size="lg"
//                   onClick={handleSubmit}
//                   disabled={isSubmitting || isUploading}
//                 >
//                   {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                   {isSubmitting ? 'Processing...' : 'Confirm for Payment'}
//                 </Button>
//               </CardFooter>
//             </Card>

//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }


import { useState, useEffect } from 'react';
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
  CreditCard, 
  MapPin,
  Mail,
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
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import axios from 'axios';
import { BASE_URL } from '@/lib/constants';

// --- Types ---

interface MonthlyStat {
  month: string;
  year: number;
  count: number; // Total number of entries
  totalAmount: number;
  totalPaid: number;
  pending: number;
}

interface FinancialSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  monthlyStats: MonthlyStat[]; 
  address: string;
  email: string;
  phone: string;
  progress: number;
}

// --- API Helper (Image Upload) ---
const uploadPaymentProof = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${BASE_URL}/api/user/upload?folder=payments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.url; 
};

// --- Components ---

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

  // --- Form State ---
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock Data State
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Init ---
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // --- Effects: Generate Mock Data on Selection ---
  useEffect(() => {
    if (customerId) {
      generateMockData();
    } else {
      setSummary(null);
      setAmount('');
    }
  }, [customerId]);

  const generateMockData = () => {
    // Simulating API fetch
    const mockTotal = Math.floor(Math.random() * 80000) + 20000;
    const mockPaid = Math.floor(Math.random() * 30000);
    
    // Generate Monthly Breakdown
    const stats: MonthlyStat[] = [
      { month: "Nov", year: 2025, count: 12, totalAmount: 45000, totalPaid: 15000, pending: 30000 },
      { month: "Oct", year: 2025, count: 8, totalAmount: 25000, totalPaid: 25000, pending: 0 },
      { month: "Sep", year: 2025, count: 5, totalAmount: 15000, totalPaid: 10000, pending: 5000 },
    ];
    
    const calcTotal = stats.reduce((acc, s) => acc + s.totalAmount, 0);
    const calcPaid = stats.reduce((acc, s) => acc + s.totalPaid, 0);
    const remaining = calcTotal - calcPaid;

    setSummary({
      totalDue: calcTotal,
      totalPaid: calcPaid,
      remaining: remaining,
      monthlyStats: stats,
      address: "Shop No. 12, Market Road, Mumbai",
      email: "customer@example.com",
      phone: "+91 98765 43210",
      progress: Math.min(100, Math.round((calcPaid / calcTotal) * 100))
    });
    
    setAmount(remaining > 0 ? remaining.toString() : '');
  };

  const handleRefresh = () => {
    if(customerId) {
      setIsRefreshing(true);
      setTimeout(() => {
        generateMockData();
        setIsRefreshing(false);
        toast.success("Balance updated");
      }, 800);
    }
  };

  // --- Handlers ---

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!customerId) return toast.error("Please select a customer");
    if (!amount) return toast.error("Please enter an amount");

    setIsSubmitting(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        setIsUploading(true);
        try {
          imageUrl = await uploadPaymentProof(imageFile);
        } catch (error) {
          toast.error("Failed to upload proof image.");
        } finally {
          setIsUploading(false);
        }
      }

      const payload = {
        customerId: parseInt(customerId),
        amount: parseFloat(amount),
        paymentMode,
        transactionDate: format(date, 'yyyy-MM-dd'),
        description,
        proofUrl: imageUrl
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Payment of ₹${payload.amount} recorded!`);
      navigate('/ledger-sheet');

    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className=" mx-auto space-y-6">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Record Payment</h1>
              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 rounded-sm px-2 font-normal">
                New Transaction
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Process payments and settle customer balances
            </p>
          </div>
          
          {/* Replaced Export/Print with Refresh */}
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={!customerId || isRefreshing}
              className="gap-2 bg-white"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} /> 
              {isRefreshing ? "Refreshing..." : "Refresh Balance"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- LEFT COLUMN (Customer & Month Summary) --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Selector Card */}
            <Card className=" shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 w-full max-w-sm">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Select Customer</Label>
                      <CustomerCombobox 
                        customers={customers}
                        value={customerId}
                        onChange={setCustomerId}
                      />
                    </div>
                    
                    {customerId && summary && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Total Outstanding</p>
                        <p className="text-xl font-bold text-red-600">₹{summary.remaining.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {customerId && summary && (
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
                        {/* <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span>{summary.email}</span>
                        </div> */}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Month-wise Summary Table */}
            <Card className=" shadow-sm h-fit overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  Monthly Summary
                </CardTitle>
                <CardDescription>Breakdown of entries, billed amount and pending dues per month.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {customerId && summary ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 border-b">
                        <tr>
                          <th className="px-6 py-3 font-medium">Month</th>
                          <th className="px-6 py-3 font-medium text-center">Entries</th>
                          <th className="px-6 py-3 font-medium text-right">Total Billed</th>
                          <th className="px-6 py-3 font-medium text-right">Paid</th>
                          <th className="px-6 py-3 font-medium text-right">Pending</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {summary.monthlyStats.map((stat, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {stat.month} {stat.year}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600">{stat.count}</Badge>
                            </td>
                            <td className="px-6 py-4 text-right font-medium">₹{stat.totalAmount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right text-green-600">₹{stat.totalPaid.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              {stat.pending > 0 ? (
                                <span className="font-bold text-red-600">₹{stat.pending.toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-400">₹0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-900 text-white">
                        <tr>
                          <td className="px-6 py-3 font-medium">Grand Total</td>
                          <td className="px-6 py-3 text-center font-medium">
                            {summary.monthlyStats.reduce((a,b) => a + b.count, 0)}
                          </td>
                          <td className="px-6 py-3 text-right font-bold">₹{summary.totalDue.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right font-bold text-green-400">₹{summary.totalPaid.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right font-bold text-red-400">₹{summary.remaining.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-gray-200" />
                    Select a customer to view monthly history.
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* --- RIGHT COLUMN (Payment Form) --- */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className=" shadow-md overflow-hidden h-full flex flex-col">
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
                   {/* <Separator /> */}
                   <div className="flex justify-between text-sm">
                     <span>Total Due</span>
                     <span className="font-medium">₹{summary?.totalDue.toLocaleString() || '0'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Paid</span>
                     <span className="font-medium text-green-600">-₹{summary?.totalPaid.toLocaleString() || '0'}</span>
                   </div>
                   <Separator />
                   <div className="flex justify-between text-base font-bold">
                     <span>Outstanding</span>
                     <span className="text-red-600">₹{summary?.remaining.toLocaleString() || '0'}</span>
                   </div>
                 </div>


                {/* Inputs */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal h-9 text-xs", !date && "text-muted-foreground")}>
                            {date ? format(date, "dd MMM yyyy") : <span>Pick date</span>}
                            <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mode</Label>
                      <Select value={paymentMode} onValueChange={setPaymentMode}>
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
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Paying Amount (₹)</Label>
                    <Input 
                      type="number" 
                      className="font-bold text-lg h-10 border-blue-200 focus-visible:ring-blue-500" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea 
                      className="resize-none h-16 text-xs" 
                      placeholder="Transaction ID / Notes..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Upload Receipt */}
                <div className="space-y-2">
                  <Label className="text-xs">Upload Receipt</Label>
                  {imagePreview ? (
                    <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in zoom-in duration-300">
                      <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-green-800">
                        {imageFile?.name || "Receipt.jpg"}
                      </div>
                      <p className="text-xs text-green-600">Upload complete</p>
                      <Button variant="outline" size="sm" onClick={removeImage} className="h-7 text-xs gap-1 hover:text-red-600 hover:border-red-200 bg-white">
                        <Trash2 className="h-3 w-3" /> Delete
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
                      <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
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
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg h-11 text-sm font-medium" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploading}
                >
                  {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </div>
    </main>
  );
}