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
import { useEffect, useState } from "react";
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
import { Columns } from "./Columns";
import {
  getSubCategories,
  selectSubCategories,
} from "@/Features/Masters/Category/categorySlice";
import {
  getAttributes,
  selectAttribute,
} from "@/Features/Masters/Attribute/attributeSlice";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getProductsType,
  selectProductsType,
} from "@/Features/Masters/ProductType/productTypeSlice";
import {
  getProductsTypeAttribute,
  productsTypeAttributeError,
  productsTypeAttributeLoading,
  selectProductsTypeAttribute,
} from "./productTypeAttributeSlice";
import { BASE_URL } from "@/lib/constants";

type Inputs = {
  productTypeId: string;
  keyAttributeIds: string[];
};

const schema = z.object({
  productTypeId: z
    .string()
    .trim()
    .min(1, { message: "Product type name is required" }),
  keyAttributeIds: z
    .array(z.string().trim())
    .min(1, { message: "Minimum one key is required" }),
});

const ProductTypeAttribute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [openAtt, setOpenAtt] = useState(false);
  const tableData = useSelector(selectProductsTypeAttribute);
  const tableLoading = useSelector(productsTypeAttributeLoading);
  const tableError = useSelector(productsTypeAttributeError);

  useEffect(() => {
    !tableData && dispatch(getProductsTypeAttribute());
  }, [tableData, dispatch]);

  const productType = useSelector(selectProductsType);

  useEffect(() => {
    !productType && dispatch(getProductsType());
  }, [productType, dispatch]);

  const attributeList = useSelector(selectAttribute);

  useEffect(() => {
    !attributeList && dispatch(getAttributes());
  }, [attributeList, dispatch]);

  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      productTypeId: "",
      keyAttributeIds: [],
    },
  });

  const onSubmit = async (data: Inputs) => {
    try {
      const res = await axios.post(
        BASE_URL + "/api/productAttributes/mapAttributesToProductType",
        data
      );
      if (res.status === 201) {
        toast.success("Product type added Successfully");
        form.reset();
        await dispatch(getProductsType());
        await dispatch(getProductsTypeAttribute()).unwrap();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Map Product Type and Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-2">
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Product Type
                        </FormLabel>
                        <Popover open={openAtt} onOpenChange={setOpenAtt}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between capitalize",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? productType &&
                                    productType.find(
                                      (data) => `${data.id}` === field.value
                                    )?.productType
                                  : "Select Product Type"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] shadow-lg rounded-md border">
                            <Command>
                              <CommandInput
                                placeholder="Search product type..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No data found.</CommandEmpty>
                                <CommandGroup>
                                  {productType &&
                                    productType.map((data) => (
                                      <CommandItem
                                        className="capitalize"
                                        value={`${data.productType}`}
                                        key={data.id}
                                        onSelect={() => {
                                          form.setValue(
                                            "productTypeId",
                                            `${data.id}`,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                          form.setValue("keyAttributeIds", []);
                                          setOpenAtt(false);
                                        }}
                                      >
                                        {data.productType}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            `${data.id}` === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
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
                {/* <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        Product Type
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="enter product type name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "after:content-['*'] after:ml-0.5 after:text-destructive",
                      form.formState.errors.keyAttributeIds &&
                        "text-destructive"
                    )}
                  >
                    Keys
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                      >
                        {form.getValues("keyAttributeIds").length === 0
                          ? "Select keys"
                          : `${form.watch("keyAttributeIds").length} selected`}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="shadow-lg w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Search keys..." />
                        <CommandList>
                          <CommandEmpty>No keys found.</CommandEmpty>
                          <CommandGroup>
                            <FormField
                              control={form.control}
                              name="keyAttributeIds"
                              render={() => (
                                <FormItem>
                                  {attributeList &&
                                    attributeList.map((item, i) => (
                                      <CommandItem key={i}>
                                        <FormField
                                          key={item.id}
                                          control={form.control}
                                          name="keyAttributeIds"
                                          render={({ field }) => {
                                            return (
                                              <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                              >
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(
                                                      `${item.id}`
                                                    )}
                                                    onCheckedChange={(
                                                      checked
                                                    ) => {
                                                      return checked
                                                        ? field.onChange([
                                                            ...field.value,
                                                            `${item.id}`,
                                                          ])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                              (value) =>
                                                                value !==
                                                                `${item.id}`
                                                            )
                                                          );
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="font-normal capitalize">
                                                  {item.attributeName}
                                                </FormLabel>
                                              </FormItem>
                                            );
                                          }}
                                        />
                                      </CommandItem>
                                    ))}
                                </FormItem>
                              )}
                            />
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                    {form.formState.errors.keyAttributeIds && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.keyAttributeIds.message}
                      </p>
                    )}
                  </Popover>
                </div>
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
        title="Product Type"
        desc=""
      />
    </div>
  );
};

export default ProductTypeAttribute;
