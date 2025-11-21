// // import { useState, useEffect } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import * as z from "zod";
// // import { Trash2, Plus, Check } from "lucide-react";
// // import { useAppDispatch, useAppSelector } from "@/app/hooks";
// // import {
// //   createPriceList,
// //   fetchPriceLists,
// //   deletePriceList,
// // } from "@/app/priceListSlice";
// // import { fetchCustomers } from "@/app/customerSlice";
// // import { useSearchParams } from "react-router-dom";
// // import {
// //   Form,
// //   FormControl,
// //   FormField,
// //   FormItem,
// //   FormLabel,
// //   FormMessage,
// // } from "@/components/ui/form";
// // import {
// //   Command,
// //   CommandEmpty,
// //   CommandGroup,
// //   CommandInput,
// //   CommandItem,
// //   CommandList,
// // } from "@/components/ui/command";
// // import {
// //   Popover,
// //   PopoverContent,
// //   PopoverTrigger,
// // } from "@/components/ui/popover";
// // import { cn } from "@/lib/utils";
// // import { fetchLedgerProducts } from "@/app/ledgerProductsSlice";

// // const DEMO_PRODUCTS = [
// //   { id: "1", name: "E+L", height: 1, width: 1 },
// //   { id: "2", name: "E+L+5mm", height: 1, width: 1 },
// //   { id: "3", name: "Satin + Pipe", height: 1, width: 1 },
// //   { id: "4", name: "E+3mm", height: 1, width: 1 },
// //   { id: "5", name: "Eco +3mm", height: 1, width: 1 },
// //   { id: "6", name: "Plain flex", height: 1, width: 1 },
// //   { id: "7", name: "Canvas", height: 1, width: 1 },
// //   { id: "8", name: "Flex new stande", height: 1, width: 1 },
// // ];

// // const priceListSchema = z.object({
// //   name: z.string().min(1, "Price list name is required"),
// //   userId: z.string().optional(),
// // });

// // type PriceListFormValues = z.infer<typeof priceListSchema>;

// // export function PriceListForm({ onSave }: { onSave: () => void }) {
// //   const dispatch = useAppDispatch();
// //   const { loading } = useAppSelector((state) => state.priceList);
// //   const { customers } = useAppSelector((state) => state.customer);
// //   const {
// //     ledgerProducts,
// //     error: LedgerProductsError,
// //     loading: LedgerProductsLoading,
// //   } = useAppSelector((state) => state.ledgerProducts);
// //   const [showForm, setShowForm] = useState(false);
// //   const [prices, setPrices] = useState<Record<string, number>>({});
// //   const [searchParams] = useSearchParams();
// //   const [openCombobox, setOpenCombobox] = useState(false);

// //   const form = useForm<PriceListFormValues>({
// //     resolver: zodResolver(priceListSchema),
// //     defaultValues: {
// //       name: "",
// //       userId: "",
// //     },
// //   });

// //   useEffect(() => {
// //     dispatch(fetchCustomers());
// //     dispatch(fetchLedgerProducts({ page: 0, size: 10 }));
// //   }, [dispatch]);

// //   // Auto-select user from URL params
// //   useEffect(() => {
// //     const userIdParam = searchParams.get("userId");
// //     if (userIdParam && customers.length > 0) {
// //       const userExists = customers.find(
// //         (c) => c.id === userIdParam || c.customerId === userIdParam
// //       );
// //       if (userExists) {
// //         form.setValue("userId", userIdParam);
// //         setShowForm(true); // Open form automatically if user is passed
// //       }
// //     }
// //   }, [searchParams, customers, form]);

// //   const handlePriceChange = (productId: string, value: string) => {
// //     setPrices((prev) => ({
// //       ...prev,
// //       [productId]: parseFloat(value) || 0,
// //     }));
// //   };

// //   const onSubmit = async (data: PriceListFormValues) => {
// //     const products = DEMO_PRODUCTS.map((p) => ({
// //       ...p,
// //       sqft: p.height * p.width,
// //       price: prices[p.id] || 0,
// //     }));

// //     // const resultAction = await dispatch(
// //       // createPriceList({
// //       //   name: data.name,
// //       //   products,

// //       // })
// //     // );

// //     // if (createPriceList.fulfilled.match(resultAction)) {
// //     //   form.reset();
// //     //   setPrices({});
// //     //   setShowForm(false);
// //     //   onSave();
// //     // }
// //   };

// //   if (!showForm) {
// //     return (
// //       <Button onClick={() => setShowForm(true)} className="gap-2">
// //         <Plus className="w-4 h-4" />
// //         Create New Price List
// //       </Button>
// //     );
// //   }

// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle>Create Price List</CardTitle>
// //       </CardHeader>
// //       <CardContent>
// //         <Form {...form}>
// //           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
// //             <div className="grid gap-4 md:grid-cols-2">
// //               <FormField
// //                 control={form.control}
// //                 name="name"
// //                 render={({ field }) => (
// //                   <FormItem>
// //                     <FormLabel>Price List Name</FormLabel>
// //                     <FormControl>
// //                       <Input placeholder="e.g., Standard List" {...field} />
// //                     </FormControl>
// //                     <FormMessage />
// //                   </FormItem>
// //                 )}
// //               />

// //               <FormField
// //                 control={form.control}
// //                 name="userId"
// //                 render={({ field }) => (
// //                   <FormItem className="flex flex-col">
// //                     <FormLabel>Link User (Optional)</FormLabel>
// //                     <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
// //                       <PopoverTrigger asChild>
// //                         <FormControl>
// //                           <Button
// //                             variant="outline"
// //                             role="combobox"
// //                             className={cn(
// //                               "w-full justify-between",
// //                               !field.value && "text-muted-foreground"
// //                             )}
// //                           >
// //                             {field.value
// //                               ? customers.find(
// //                                   (customer) =>
// //                                     (customer.id || customer.customerId) ===
// //                                     field.value
// //                                 )?.firstname
// //                               : "Select user"}
// //                             <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
// //                           </Button>
// //                         </FormControl>
// //                       </PopoverTrigger>
// //                       <PopoverContent className="w-[200px] p-0">
// //                         <Command>
// //                           <CommandInput placeholder="Search user..." />
// //                           <CommandList>
// //                             <CommandEmpty>No user found.</CommandEmpty>
// //                             <CommandGroup>
// //                               {customers.map((customer) => (
// //                                 <CommandItem
// //                                   value={`${customer.customerId}`}
// //                                   key={customer.id || customer.customerId}
// //                                   onSelect={() => {
// //                                     form.setValue(
// //                                       "userId",
// //                                      "25"
// //                                     );
// //                                     setOpenCombobox(false);
// //                                   }}
// //                                 >
// //                                   <Check
// //                                     className={cn(
// //                                       "mr-2 h-4 w-4",
// //                                       (customer.id || customer.customerId) ===
// //                                         field.value
// //                                         ? "opacity-100"
// //                                         : "opacity-0"
// //                                     )}
// //                                   />
// //                                   {customer.firstname}
// //                                 </CommandItem>
// //                               ))}
// //                             </CommandGroup>
// //                           </CommandList>
// //                         </Command>
// //                       </PopoverContent>
// //                     </Popover>
// //                     <FormMessage />
// //                   </FormItem>
// //                 )}
// //               />
// //             </div>

// //             <div>
// //               <Label className="text-base font-semibold mb-4 block">
// //                 Set Prices for Products (Height: 1, Width: 1)
// //               </Label>
// //               <div className="border rounded-lg overflow-hidden">
// //                 <Table>
// //                   <TableHeader>
// //                     <TableRow>
// //                       <TableHead>Product Name</TableHead>
// //                       <TableHead>Height</TableHead>
// //                       <TableHead>Width</TableHead>
// //                       <TableHead>Sq Ft</TableHead>
// //                       <TableHead>Price</TableHead>
// //                       <TableHead>Base Price</TableHead>
// //                     </TableRow>
// //                   </TableHeader>
// //                   <TableBody>
// //                     {ledgerProducts?.map((product) => (
// //                       <TableRow key={product.productId}>
// //                         <TableCell className="font-medium">
// //                           {product.name}
// //                         </TableCell>
// //                         <TableCell>{product.attributes[0].height}</TableCell>
// //                         <TableCell>{product.attributes[0].width}</TableCell>
// //                         <TableCell>
// //                           {product.attributes[0].height *
// //                             product.attributes[0].width}
// //                         </TableCell>
// //                         <TableCell>₹{product.attributes[0].price.toFixed(2)}</TableCell>
// //                         <TableCell>
// //                           <Input
// //                             type="number"
// //                             min="0"
// //                             step="0.01"
// //                             value={prices[product.productId] || ""}
// //                             onChange={(e) =>
// //                               handlePriceChange(
// //                                 `${product.productId}`,
// //                                 e.target.value
// //                               )
// //                             }
// //                             placeholder="0"
// //                             className="w-24"
// //                           />
// //                         </TableCell>

// //                       </TableRow>
// //                     ))}
// //                   </TableBody>
// //                 </Table>
// //               </div>
// //             </div>

// //             <div className="flex gap-3">
// //               <Button type="submit" disabled={loading}>
// //                 {loading ? "Saving..." : "Save Price List"}
// //               </Button>
// //               <Button
// //                 type="button"
// //                 variant="outline"
// //                 onClick={() => {
// //                   setShowForm(false);
// //                   // setListName('');
// //                   setPrices({});
// //                 }}
// //               >
// //                 Cancel
// //               </Button>
// //             </div>
// //           </form>
// //         </Form>
// //       </CardContent>
// //     </Card>
// //   );
// // }

// // export function PriceListsDisplay() {
// //   const dispatch = useAppDispatch();
// //   const { priceLists, loading } = useAppSelector((state) => state.priceList);

// //   useEffect(() => {
// //     dispatch(fetchPriceLists());
// //   }, [dispatch]);

// //   if (loading && priceLists.length === 0) {
// //     return <div className="text-center py-8">Loading price lists...</div>;
// //   }

// //   if (priceLists.length === 0) {
// //     return (
// //       <Card>
// //         <CardContent className="pt-6">
// //           <p className="text-muted-foreground text-center py-8">
// //             No price lists created yet
// //           </p>
// //         </CardContent>
// //       </Card>
// //     );
// //   }

// //   return (
// //     <div className="space-y-4">
// //       {priceLists.map((list) => (
// //         <Card key={list.id}>
// //           <CardHeader className="pb-3">
// //             <div className="flex justify-between items-start">
// //               <div>
// //                 <CardTitle>{list.name} for {list.firstname}</CardTitle>
// //                 <p className="text-sm text-muted-foreground mt-1">
// //                   {list.productPrices?.length} products
// //                 </p>
// //               </div>
// //               <Button
// //                 variant="ghost"
// //                 size="sm"
// //                 onClick={() => {
// //                   if (confirm("Delete this price list?")) {
// //                     dispatch(deletePriceList(list.id.toString()));
// //                   }
// //                 }}
// //               >
// //                 <Trash2 className="w-4 h-4" />
// //               </Button>
// //             </div>
// //           </CardHeader>
// //           <CardContent>
// //             <div className="border rounded-lg overflow-hidden">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow className="bg-muted/50">
// //                     <TableHead>Product</TableHead>
// //                     <TableHead>H</TableHead>
// //                     <TableHead>W</TableHead>
// //                     <TableHead>Sq Ft</TableHead>
// //                     <TableHead>Base Price</TableHead>
// //                     <TableHead>Price</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {list.productPrices?.map((product) => (
// //                     <TableRow key={product.productId}>
// //                       <TableCell className="font-medium">
// //                         {product.productName}
// //                       </TableCell>
// //                       <TableCell>1</TableCell>
// //                       <TableCell>1</TableCell>
// //                       <TableCell>1</TableCell>
// //                       <TableCell>₹{product.basePrice.toFixed(2)}</TableCell>
// //                       <TableCell>₹{product.price.toFixed(2)}</TableCell>
// //                     </TableRow>
// //                   ))}
// //                 </TableBody>
// //               </Table>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       ))}
// //     </div>
// //   );
// // }

// import { useState, useEffect, useRef, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Trash2, Plus, Check, Loader2, Search } from "lucide-react";
// import { useAppDispatch, useAppSelector } from "@/app/hooks";
// import {
//   createPriceList,
//   fetchPriceLists,
//   deletePriceList,
// } from "@/app/priceListSlice";
// import { fetchCustomers } from "@/app/customerSlice";
// import { useSearchParams } from "react-router-dom";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import {
//   fetchLedgerProducts,
//   resetProductList,
//   ledgerProductsDataType
// } from "@/app/ledgerProductsSlice";

// // Local interface for the table selection state
// interface SelectedProduct extends ledgerProductsDataType {
//   customPrice: number;
// }

// // Zod Schema validation
// const priceListSchema = z.object({
//   name: z.string().min(1, "Price list name is required"),
//   userId: z.coerce.number().min(1, "User is required"),
// });

// type PriceListFormValues = z.infer<typeof priceListSchema>;

// // ------------------------------------------------------------------
// // COMPONENT: PriceListForm
// // ------------------------------------------------------------------
// export function PriceListForm({ onSave }: { onSave: () => void }) {
//   const dispatch = useAppDispatch();

//   // Redux Selectors
//   const { loading: submitting } = useAppSelector((state) => state.priceList);
//   const { customers } = useAppSelector((state) => state.customer);
//   const {
//     infiniteList: products,
//     hasMore,
//     loading: fetchingProducts,
//     currentPage,
//     isSearching
//   } = useAppSelector((state) => state.ledgerProducts);

//   // Local State
//   const [showForm, setShowForm] = useState(false);
//   const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
//   const [openUserCombo, setOpenUserCombo] = useState(false);
//   const [openProductCombo, setOpenProductCombo] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const [searchParams] = useSearchParams();

//   // Infinite Scroll Observer Ref
//   const observer = useRef<IntersectionObserver | null>(null);

//   const form = useForm<PriceListFormValues>({
//     resolver: zodResolver(priceListSchema),
//     defaultValues: {
//       name: "",
//       userId: 0,
//     },
//   });

//   // 1. Fetch Customers on Mount
//   useEffect(() => {
//     dispatch(fetchCustomers());
//   }, [dispatch]);

//   // 2. Handle URL Params (Pre-select user)
//   useEffect(() => {
//     const userIdParam = searchParams.get("userId");
//     if (userIdParam && customers.length > 0) {
//       const userExists = customers.find(
//         (c) => c.id.toString() === userIdParam || c.customerId.toString() === userIdParam
//       );
//       if (userExists) {
//         form.setValue("userId", Number(userExists.id || userExists.customerId));
//         setShowForm(true);
//       }
//     }
//   }, [searchParams, customers, form]);

//   // 3. Debounce Search Logic
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       // Only fetch if the popover is open to prevent random calls
//       if (openProductCombo) {
//         dispatch(fetchLedgerProducts({
//           page: 0,
//           size: 10,
//           search: searchTerm // This will trigger URL encoding in slice
//         }));
//       }
//     }, 500); // 500ms wait

//     return () => clearTimeout(timer);
//   }, [searchTerm, openProductCombo, dispatch]);

//   // 4. Infinite Scroll Logic
//   const lastElementRef = useCallback(
//     (node: HTMLDivElement) => {
//       if (fetchingProducts) return;
//       if (observer.current) observer.current.disconnect();

//       // We only attach the observer if we are NOT in search mode and have more pages
//       if (!isSearching && hasMore) {
//         observer.current = new IntersectionObserver((entries) => {
//           if (entries[0].isIntersecting) {
//             dispatch(fetchLedgerProducts({
//               page: currentPage + 1,
//               size: 10,
//               search: ""
//             }));
//           }
//         });
//         if (node) observer.current.observe(node);
//       }
//     },
//     [fetchingProducts, hasMore, currentPage, isSearching, dispatch]
//   );

//   // 5. Helper: Select/Deselect Product
//   const handleSelectProduct = (product: ledgerProductsDataType) => {
//     const exists = selectedProducts.find((p) => p.productId === product.productId);

//     if (exists) {
//       // Remove
//       setSelectedProducts((prev) => prev.filter((p) => p.productId !== product.productId));
//     } else {
//       // Add with default price
//       const basePrice = product.attributes?.[0]?.price || 0;
//       setSelectedProducts((prev) => [...prev, { ...product, customPrice: basePrice }]);
//     }
//   };

//   // 6. Helper: Change Price in Table
//   const handlePriceChange = (productId: number, newPrice: string) => {
//     const priceValue = parseFloat(newPrice);
//     setSelectedProducts((prev) =>
//       prev.map((p) =>
//         p.productId === productId ? { ...p, customPrice: isNaN(priceValue) ? 0 : priceValue } : p
//       )
//     );
//   };

//   // 7. Submit Handler
//   const onSubmit = async (data: PriceListFormValues) => {
//     if (selectedProducts.length === 0) {
//       alert("Please select at least one product.");
//       return;
//     }

//     // Construct exact JSON payload
//     const payload = {
//       name: data.name,
//       userId: data.userId,
//       productPrices: selectedProducts.map((p) => ({
//         productId: p.productId,
//         price: p.customPrice,
//       })),
//     };

//     const resultAction = await dispatch(createPriceList(payload));

//     if (createPriceList.fulfilled.match(resultAction)) {
//       form.reset();
//       setSelectedProducts([]);
//       setSearchTerm("");
//       setShowForm(false);
//       onSave(); // Callback to refresh list
//     }
//   };

//   if (!showForm) {
//     return (
//       <Button onClick={() => setShowForm(true)} className="gap-2">
//         <Plus className="w-4 h-4" />
//         Create New Price List
//       </Button>
//     );
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>Create Custom Price List</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

//             {/* --- Header Inputs (Name & Customer) --- */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Price List Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., Wholesale Pricing" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="userId"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Customer</FormLabel>
//                     <Popover open={openUserCombo} onOpenChange={setOpenUserCombo}>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             className={cn(
//                               "w-full justify-between",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value
//                               ? customers.find(
//                                   (c) => (c.id || c.customerId) == field.value.toString()
//                                 )?.firstname || "Unknown User"
//                               : "Select customer"}
//                             <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-[300px] p-0">
//                         <Command>
//                           <CommandInput placeholder="Search customer..." />
//                           <CommandList>
//                             <CommandEmpty>No customer found.</CommandEmpty>
//                             <CommandGroup>
//                               {customers.map((customer) => (
//                                 <CommandItem
//                                   value={customer.firstname}
//                                   key={customer.id || customer.customerId}
//                                   onSelect={() => {
//                                     form.setValue("userId", Number(customer.id || customer.customerId));
//                                     setOpenUserCombo(false);
//                                   }}
//                                 >
//                                   <Check
//                                     className={cn(
//                                       "mr-2 h-4 w-4",
//                                       (customer.id || customer.customerId) == field.value.toString()
//                                         ? "opacity-100"
//                                         : "opacity-0"
//                                     )}
//                                   />
//                                   {customer.firstname}
//                                 </CommandItem>
//                               ))}
//                             </CommandGroup>
//                           </CommandList>
//                         </Command>
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* --- Product Selection (Popover + Infinite Scroll) --- */}
//             <div className="space-y-2">
//               <Label>Select Products</Label>
//               <Popover
//                 open={openProductCombo}
//                 onOpenChange={(open) => {
//                   setOpenProductCombo(open);
//                   if (!open) {
//                     // Reset when closing to keep memory clean
//                     dispatch(resetProductList());
//                     setSearchTerm("");
//                   }
//                 }}
//               >
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     role="combobox"
//                     className="w-full justify-between text-left font-normal"
//                   >
//                     <span className="truncate">
//                       {selectedProducts.length > 0
//                         ? `${selectedProducts.length} products selected`
//                         : "Search and select products..."}
//                     </span>
//                     <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-[600px] p-0" align="start">
//                   {/* shouldFilter={false} is CRITICAL because filtering is done Server-Side */}
//                   <Command shouldFilter={false}>
//                     <CommandInput
//                       placeholder="Search products (e.g. E+L+3mm)..."
//                       value={searchTerm}
//                       onValueChange={setSearchTerm}
//                     />
//                     <CommandList className="max-h-[300px] overflow-y-auto">
//                       {fetchingProducts && currentPage === 0 ? (
//                          <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
//                             <Loader2 className="h-4 w-4 animate-spin mr-2"/> Loading...
//                          </div>
//                       ) : (
//                         products.length === 0 && <CommandEmpty>No products found.</CommandEmpty>
//                       )}

//                       <CommandGroup>
//                         {products.map((product) => {
//                           const isSelected = selectedProducts.some(p => p.productId === product.productId);
//                           return (
//                             <CommandItem
//                               key={product.productId}
//                               value={product.name}
//                               onSelect={() => handleSelectProduct(product)}
//                             >
//                               <div className="flex items-center w-full cursor-pointer">
//                                 <div className={cn(
//                                   "mr-3 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
//                                   isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
//                                 )}>
//                                   <Check className="h-3 w-3" />
//                                 </div>
//                                 <div className="flex flex-col">
//                                   <span className="font-medium">{product.name}</span>
//                                   <span className="text-xs text-muted-foreground">
//                                     SKU: {product.defaultSku} | Base: ₹{product.attributes?.[0]?.price ?? 'N/A'}
//                                   </span>
//                                 </div>
//                               </div>
//                             </CommandItem>
//                           );
//                         })}
//                       </CommandGroup>

//                       {/* Infinite Scroll Trigger: Only show if pagination mode AND more pages exist */}
//                       {!isSearching && hasMore && (
//                         <div ref={lastElementRef} className="p-2 flex justify-center items-center w-full h-8">
//                           {fetchingProducts && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
//                         </div>
//                       )}
//                     </CommandList>
//                   </Command>
//                 </PopoverContent>
//               </Popover>
//             </div>

//             {/* --- Selected Products Table --- */}
//             {selectedProducts.length > 0 && (
//               <div className="border rounded-lg overflow-hidden">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-muted/50">
//                       <TableHead>Product Name</TableHead>
//                       <TableHead>SKU</TableHead>
//                       <TableHead>Base Price</TableHead>
//                       <TableHead className="w-[140px]">Your Price</TableHead>
//                       <TableHead className="w-[50px]"></TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {selectedProducts.map((product) => (
//                       <TableRow key={product.productId}>
//                         <TableCell className="font-medium">{product.name}</TableCell>
//                         <TableCell className="text-muted-foreground text-sm">{product.defaultSku}</TableCell>
//                         <TableCell>₹{product.attributes?.[0]?.price.toFixed(2)}</TableCell>
//                         <TableCell>
//                           <Input
//                             type="number"
//                             min="0"
//                             step="0.01"
//                             value={product.customPrice}
//                             onChange={(e) => handlePriceChange(product.productId, e.target.value)}
//                             className="h-8"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => setSelectedProducts(prev => prev.filter(p => p.productId !== product.productId))}
//                             className="text-red-500 hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             )}

//             {/* --- Actions --- */}
//             <div className="flex gap-3 justify-end pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setShowForm(false);
//                   setSelectedProducts([]);
//                   setSearchTerm("");
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={submitting}>
//                 {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 {submitting ? "Saving..." : "Create Price List"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }

// // ------------------------------------------------------------------
// // COMPONENT: PriceListsDisplay (Simple List View)
// // ------------------------------------------------------------------
// export function PriceListsDisplay() {
//   const dispatch = useAppDispatch();
//   const { priceLists, loading } = useAppSelector((state) => state.priceList);

//   useEffect(() => {
//     dispatch(fetchPriceLists());
//   }, [dispatch]);

//   if (loading && priceLists.length === 0) {
//     return <div className="text-center py-8 text-muted-foreground">Loading price lists...</div>;
//   }

//   if (priceLists.length === 0) {
//     return (
//       <Card>
//         <CardContent className="pt-6">
//           <p className="text-muted-foreground text-center py-8">No price lists created yet</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-4 mt-6">
//       <h3 className="text-lg font-semibold">Existing Price Lists</h3>
//       {priceLists.map((list) => (
//         <Card key={list.id}>
//           <CardHeader className="pb-3">
//             <div className="flex justify-between items-start">
//               <div>
//                 <CardTitle>{list.name}</CardTitle>
//                 <p className="text-sm text-muted-foreground">Customer ID: {list.userid}</p>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   if (confirm("Delete this price list?")) {
//                     dispatch(deletePriceList(list.id.toString()));
//                   }
//                 }}
//               >
//                 <Trash2 className="w-4 h-4 text-red-500" />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-sm text-muted-foreground mb-2">
//               Products configured: {list.productPrices?.length || 0}
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Check, Loader2, Search, Edit } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createPriceList,
  fetchPriceLists,
  deletePriceList,
  updatePriceList,
  PriceList as PriceListType,
} from "@/app/priceListSlice";
import { fetchCustomers } from "@/app/customerSlice";
import { useSearchParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  fetchLedgerProducts,
  resetProductList,
  ledgerProductsDataType,
} from "@/app/ledgerProductsSlice";

// --- Types & Interfaces ---

// We need a flexible type because "Edited" products from the backend
// might miss some details (like attributes array) that "New" products from search have.
interface SelectedProduct {
  productId: number;
  name: string;
  defaultSku?: string; // Optional because edit data might not have it
  customPrice: number;
  basePrice: number;
}

const priceListSchema = z.object({
  name: z.string().min(1, "Price list name is required"),
  userId: z.coerce.number().min(1, "User is required"),
});

type PriceListFormValues = z.infer<typeof priceListSchema>;

// ------------------------------------------------------------------
// PARENT WRAPPER: PriceListManager
// ------------------------------------------------------------------
export default function PriceListManager() {
  const [editingList, setEditingList] = useState<PriceListType | null>(null);

  // Use this key to force re-render/reset of form when cancelling edit
  const [formKey, setFormKey] = useState(0);

  const handleEdit = (list: PriceListType) => {
    setEditingList(list);
    setFormKey((prev) => prev + 1);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveOrCancel = () => {
    setEditingList(null);
    setFormKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <PriceListForm
        key={formKey} // Key forces reset on mode change
        initialData={editingList}
        onSave={handleSaveOrCancel}
        onCancel={handleSaveOrCancel}
      />
      <PriceListsDisplay onEdit={handleEdit} />
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT: PriceListForm
// ------------------------------------------------------------------
interface PriceListFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: PriceListType | null;
}

export function PriceListForm({
  onSave,
  onCancel,
  initialData,
}: PriceListFormProps) {
  const dispatch = useAppDispatch();

  // Redux Selectors
  const { loading: submitting } = useAppSelector((state) => state.priceList);
  const { customers } = useAppSelector((state) => state.customer);
  const {
    infiniteList: products,
    hasMore,
    loading: fetchingProducts,
    currentPage,
    isSearching,
  } = useAppSelector((state) => state.ledgerProducts);

  // Local State
  const [showForm, setShowForm] = useState(!!initialData);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [openUserCombo, setOpenUserCombo] = useState(false);
  const [openProductCombo, setOpenProductCombo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [searchParams] = useSearchParams();
  const observer = useRef<IntersectionObserver | null>(null);

  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListSchema),
    defaultValues: {
      name: initialData?.name || "",
      userId: initialData?.userid || 0,
    },
  });

  // --- Initialization Logic for Edit Mode ---
  useEffect(() => {
    if (initialData) {
      setShowForm(true);
      // Map existing products to our selection format
      // Note: Edit data might miss SKU or detailed attributes, so we map what we have
      const mappedProducts: SelectedProduct[] = initialData.productPrices.map(
        (p) => ({
          productId: p.productId,
          name: p.productName,
          customPrice: p.price,
          basePrice: p.basePrice,
          defaultSku: "N/A", // Placeholder as API doesn't return SKU in PriceList object
        })
      );
      setSelectedProducts(mappedProducts);

      // Set form values
      form.setValue("name", initialData.name);
      form.setValue("userId", initialData.userid);
    } else {
      dispatch(fetchCustomers());
    }
  }, [initialData, form, dispatch]);

  // Handle URL Params (only if not editing)
  useEffect(() => {
    if (!initialData) {
      const userIdParam = searchParams.get("userId");
      if (userIdParam && customers.length > 0) {
        const userExists = customers.find(
          (c) =>
            c.id.toString() === userIdParam ||
            c.customerId.toString() === userIdParam
        );
        if (userExists) {
          form.setValue(
            "userId",
            Number(userExists.id || userExists.customerId)
          );
          setShowForm(true);
        }
      }
    }
  }, [searchParams, customers, form, initialData]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (openProductCombo) {
        dispatch(
          fetchLedgerProducts({
            page: 0,
            size: 10,
            search: searchTerm,
          })
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, openProductCombo, dispatch]);

  // Infinite Scroll
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (fetchingProducts) return;
      if (observer.current) observer.current.disconnect();

      if (!isSearching && hasMore) {
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            dispatch(
              fetchLedgerProducts({
                page: currentPage + 1,
                size: 10,
                search: "",
              })
            );
          }
        });
        if (node) observer.current.observe(node);
      }
    },
    [fetchingProducts, hasMore, currentPage, isSearching, dispatch]
  );

  const handleSelectProduct = (product: ledgerProductsDataType) => {
    const exists = selectedProducts.find(
      (p) => p.productId === product.productId
    );
    if (exists) {
      setSelectedProducts((prev) =>
        prev.filter((p) => p.productId !== product.productId)
      );
    } else {
      const basePrice = product.attributes?.[0]?.price || 0;
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          defaultSku: product.defaultSku,
          basePrice: basePrice,
          customPrice: basePrice,
        },
      ]);
    }
  };

  const handlePriceChange = (productId: number, newPrice: string) => {
    const priceValue = parseFloat(newPrice);
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, customPrice: isNaN(priceValue) ? 0 : priceValue }
          : p
      )
    );
  };

  const onSubmit = async (data: PriceListFormValues) => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    const payloadData = {
      name: data.name,
      userId: data.userId,
      productPrices: selectedProducts.map((p) => ({
        productId: p.productId,
        price: p.customPrice,
      })),
    };

    let resultAction;
    if (initialData) {
      // UPDATE Mode
      resultAction = await dispatch(
        updatePriceList({
          id: initialData.id,
          data: payloadData,
        })
      );
    } else {
      // CREATE Mode
      resultAction = await dispatch(createPriceList(payloadData));
    }

    if (
      createPriceList.fulfilled.match(resultAction) ||
      updatePriceList.fulfilled.match(resultAction)
    ) {
      form.reset();
      setSelectedProducts([]);
      setSearchTerm("");
      setShowForm(false);
      onSave();
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Create New Price List
      </Button>
    );
  }

  return (
    <Card className="w-full border-2 border-muted/40">
      <CardHeader>
        <CardTitle>
          {initialData
            ? `Edit Price List: ${initialData.name}`
            : "Create Custom Price List"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price List Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wholesale Pricing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="flex mt-2.5 flex-col">
                    <FormLabel>Customer</FormLabel>
                    <Popover
                      open={openUserCombo}
                      onOpenChange={setOpenUserCombo}
                      modal={false}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? customers.find(
                                  (c) =>
                                    (c.id || c.customerId) ==
                                    field.value.toString()
                                )?.firstname ||
                                (initialData ? "Selected User" : "Unknown User")
                              : "Select customer"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] sm:w-[400px]  p-0">
                        <Command>
                          <CommandInput placeholder="Search customer..." />
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem
                                  value={customer.firstname}
                                  key={customer.id || customer.customerId}
                                  onSelect={() => {
                                    form.setValue(
                                      "userId",
                                      Number(customer.id || customer.customerId)
                                    );
                                    setOpenUserCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (customer.id || customer.customerId) ==
                                        field.value.toString()
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {customer.firstname}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label>Select Products</Label>
              <Popover
                open={openProductCombo}
                onOpenChange={(open) => {
                  setOpenProductCombo(open);
                  if (!open) {
                    dispatch(resetProductList());
                    setSearchTerm("");
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">
                      {selectedProducts.length > 0
                        ? `${selectedProducts.length} products selected`
                        : "Search and select products..."}
                    </span>
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search products..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      {fetchingProducts && currentPage === 0 ? (
                        <div className="p-4 text-center flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                          Loading...
                        </div>
                      ) : (
                        products.length === 0 && (
                          <CommandEmpty>No products found.</CommandEmpty>
                        )
                      )}

                      <CommandGroup>
                        {products.map((product) => {
                          const isSelected = selectedProducts.some(
                            (p) => p.productId === product.productId
                          );
                          return (
                            <CommandItem
                              key={product.productId}
                              value={product.name}
                              onSelect={() => handleSelectProduct(product)}
                            >
                              <div className="flex items-center w-full cursor-pointer">
                                <div
                                  className={cn(
                                    "mr-3 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "opacity-50 [&_svg]:invisible"
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {product.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    SKU: {product.defaultSku} | Base: ₹
                                    {product.attributes?.[0]?.price ?? "N/A"}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>

                      {!isSearching && hasMore && (
                        <div
                          ref={lastElementRef}
                          className="p-2 flex justify-center items-center w-full h-8"
                        >
                          {fetchingProducts && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Table */}
            {selectedProducts.length > 0 && (
              <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead className="w-[140px]">Your Price</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {product.defaultSku}
                        </TableCell>
                        <TableCell>₹{product.basePrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={product.customPrice}
                            onChange={(e) =>
                              handlePriceChange(
                                product.productId,
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedProducts((prev) =>
                                prev.filter(
                                  (p) => p.productId !== product.productId
                                )
                              )
                            }
                            className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSelectedProducts([]);
                  onCancel();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submitting
                  ? initialData
                    ? "Updating..."
                    : "Creating..."
                  : initialData
                  ? "Update Price List"
                  : "Create Price List"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// COMPONENT: PriceListsDisplay
// ------------------------------------------------------------------
interface PriceListsDisplayProps {
  onEdit?: (list: PriceListType) => void;
}

export function PriceListsDisplay({ onEdit }: PriceListsDisplayProps) {
  const dispatch = useAppDispatch();
  const { priceLists, loading } = useAppSelector((state) => state.priceList);

  useEffect(() => {
    dispatch(fetchPriceLists());
  }, [dispatch]);

  if (loading && priceLists.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading price lists...
      </div>
    );
  }

  if (priceLists.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            No price lists created yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-lg font-semibold">Existing Price Lists</h3>
      {priceLists.map((list) => (
        <Card key={list.id} className="overflow-hidden">
          <CardHeader className="bg-muted/20 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{list.name} for {list.firstname}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Customer ID: {list.userid} • {list.productPrices?.length}{" "}
                  Products
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEdit && onEdit(list)}
                  disabled={!onEdit}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (confirm("Delete this price list?")) {
                      dispatch(deletePriceList(list.id.toString()));
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Show products inside the card "just like it was before" */}
          <CardContent className="p-0">
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead>Product Name</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Special Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.productPrices?.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>₹{product.basePrice.toFixed(2)}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ₹{product.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!list.productPrices || list.productPrices.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-4"
                      >
                        No products in this list
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
