import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Package,
  DollarSign,
  ShoppingCart,
  RotateCcw,
  Edit,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, set } from "date-fns";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { useAppDispatch } from "@/app/hooks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchInventoryAsync, InventoryItem } from "@/app/inventorySlice";

export interface ProductTableProps {
  products: InventoryItem[];
  currentPage: number;
  pageSize: number;
}

export const schema = z.object({
  newStock: z.string(),
});

export default function ProductTable({
  products,
  currentPage,
  pageSize,
}: ProductTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<InventoryItem>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const handleSort = (field: string) => {
    const newOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    navigate(`?sortBy=${field}&sortDirection=${newOrder}`);
  };

  const handleEditClick = (product: InventoryItem) => {
    setEditingProduct(product);
    setOpen(true);
  };

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const res = await axios.post(BASE_URL + "/api/update/inventory", {
        ...values,
        id: editingProduct?.id,
      });
      if (res.status === 200) {
        toast.success("Inventory updated successfully");
        dispatch(
          fetchInventoryAsync(`?pageSize=${pageSize}&page=${currentPage}`)
        );
        setOpen(false);
        form.reset();
      } else {
        console.error("Unexpected response status:", res.status);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  }
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {/* 1. */}
            <TableHead className="text-black cursor-pointer">
              Product Name
            </TableHead>

            {/* 2. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("sku_id")}
            >
              SKU {sortField === "sku_id" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 3. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("open_stock")}
            >
              Open Stock
              {sortField === "open_stock" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 4. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("new_stock")}
            >
              New Stock
              {sortField === "new_stock" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 5. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("sales")}
            >
              Sales {sortField === "sales" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 6. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("return_good")}
            >
              Returns
              {sortField === "return_good" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 7. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("exchangeGoods")}
            >
              Exchange
              {sortField === "exchangeGoods" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 8. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("exchange_on_hold")}
            >
              Exchange on hold
              {sortField === "exchange_on_hold" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 9. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              Last Updated Stock
              {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 10. */}
            <TableHead
              className="text-black cursor-pointer"
              onClick={() => handleSort("final_in_stock")}
            >
              Final Stock
              {sortField === "final_in_stock" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>

            {/* 11. */}
            <TableHead className="text-black w-14 ">
              Transaction History
            </TableHead>

            {/* 12. */}
            <TableHead className="text-black">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <>
              <TableRow key={product.id} className="group hover:bg-muted/50">
                {/*1. Product Name */}
                <TableCell>
                  <div>
                    <p className="font-medium">{product?.productName}</p>
                  </div>
                </TableCell>

                {/*2. SKU */}
                <TableCell>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                    {product?.sku}
                  </div>
                </TableCell>

                {/*3. Open Stock */}
                <TableCell>{product.openStock}</TableCell>

                {/*4. New Stock */}
                <TableCell>{product.newStock}</TableCell>

                {/*5. Sales */}
                <TableCell>
                  <div className="flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-muted-foreground" />
                    {product.sales}
                  </div>
                </TableCell>

                {/*6. Return Good */}
                <TableCell>
                  <div className="flex items-center justify-center">
                    {/* <RotateCcw className="w-4 h-4 mr-2 text-muted-foreground" /> */}
                    {product.returnGood}
                  </div>
                </TableCell>

                {/*7. Exchange Good */}
                <TableCell className="text-center">
                  {product.exchangeGoods || 0}
                </TableCell>

                {/*8. Exchange On Hold */}
                <TableCell className="text-center">
                  {product.exchangeOnHold || 0}
                </TableCell>

                {/*9. Last Updated Stock */}
                <TableCell>
                  {format(product.createdAt, "MMMM do, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product?.finalInStock <= product?.lowStockThreshold
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {product.finalInStock}
                  </Badge>
                </TableCell>

                {/* 10.Transaction History */}
                <TableCell className="cursor-pointer text-blue-500 ">
                  {
                    <Eye
                      onClick={() =>
                        navigate(`/transaction?sku=${product?.sku}`)
                      }
                    />
                  }
                </TableCell>

                {/* 11. Edit */}
                <TableCell>
                  <div className="flex items-center">
                    <Dialog onOpenChange={setOpen} open={open}>
                      <DialogTrigger>
                        <Button
                          onClick={() => handleEditClick(product)}
                          variant="ghost"
                        >
                          <Edit className="w-4 h-4 mr-2 text-green-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Stock Details</DialogTitle>
                          <DialogDescription>
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8 text-black"
                              >
                                <FormField
                                  control={form.control}
                                  name="newStock"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Add New Stock</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="New Stock"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button type="submit">Submit</Button>
                              </form>
                            </Form>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
