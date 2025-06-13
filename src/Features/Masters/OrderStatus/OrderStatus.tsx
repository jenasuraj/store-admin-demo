import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { AppDispatch } from "@/app/store";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Schema, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import Table from "@/components/table/Table";
import {
  getSubCategories,
  selectSubCategories,
} from "../Category/categorySlice";
import { Columns } from "./Columns";
import { selectOrderEntity } from "@/app/OrderSlice";
import {
  getOrderStatusAsync,
  orderStatusError,
  orderStatusLoading,
  selectOrderStatus,
} from "./orderStatusSlice";
import { table } from "console";
import { BASE_URL } from "@/lib/constants";

type Inputs = {
  orderStatus: string;
  statusLevel: string;
};

const schema = z.object({
  orderStatus: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z
      .string()
      .refine((val) => String(val), {
        message: "Enter a valid name",
      })
      .transform((val) => val?.toUpperCase())
  ),
  statusLevel: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z
      .string()
      .refine((val) => !isNaN(Number(val)), {
        message: "Enter a valid number",
      })
      .transform((val) => parseInt(val, 10))
  ),
});

const OrderStatus = () => {
  const dispatch = useDispatch<AppDispatch>();

  const tableData = useSelector(selectOrderStatus);
  const tableLoading = useSelector(orderStatusLoading);
  const tableError = useSelector(orderStatusError);

  useEffect(() => {
    !tableData && dispatch(getOrderStatusAsync());
  }, [tableData, dispatch]);

  const subCategoryList = useSelector(selectSubCategories);

  useEffect(() => {
    !subCategoryList && dispatch(getSubCategories());
  }, [subCategoryList, dispatch]);

  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderStatus: "",
      statusLevel: "",
    },
  });

  const onSubmit = async (data: Inputs) => {
    try {
      const res = await axios.post(BASE_URL + "/api/orderstatus/add", data);
      if (res.status === 201 || res.status === 200) {
        form.reset();
        toast.success("Order Status added Successfully");
        await dispatch(getOrderStatusAsync()).unwrap();
      }
    } catch (error: any) {
      toast.error(error?.response?.data || "Error adding Order Status");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Order Status Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-2">
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="orderStatus"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Status
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Confirmed" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="statusLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        Status Level
                      </FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="eg.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-full">
                  <Button disabled={form.formState.isSubmitting} type="submit">
                    {form.formState.isSubmitting && (
                      <Loader className="animate-spin w-4 mr-1" />
                    )}
                    Add
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Table
        data={tableData}
        COLUMNS={Columns}
        loading={tableLoading}
        error={tableError}
        title="Order Status"
        desc=""
      />
    </div>
  );
};

export default OrderStatus;
