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
import { useFieldArray, useForm } from "react-hook-form";
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
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
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
import {
  attributesError,
  attributesLoading,
  getAttributes,
  selectAttribute,
} from "./attributeSlice";
import {
  getProductsType,
  selectProductsType,
} from "../ProductType/productTypeSlice";
import { Columns } from "./Columns";
import { BASE_URL } from "@/lib/constants";

type Inputs = {
  productTypeId: string;
  keyName: string;
  values: any[];
};
const schema = z.object({
  productTypeId: z.string().min(1, { message: "Product type is mandatory" }),
  keyName: z.string().min(1, { message: "Attribute is mandatory" }),
  values: z.array(z.string().trim().min(1, "Value cannot be empty")),
});
const Attribute = () => {
  const dispatch = useDispatch<AppDispatch>();

  const tableData = useSelector(selectAttribute);
  const tableLoading = useSelector(attributesLoading);
  const tableError = useSelector(attributesError);
  const [prodTypeOpen, setProdTypeOpen] = useState(false);
  const [attriOpen, setAttriOpen] = useState(false);

  useEffect(() => {
    !tableData && dispatch(getAttributes());
  }, [tableData, dispatch]);

  const attributeList = useSelector(selectAttribute);

  useEffect(() => {
    !attributeList && dispatch(getAttributes());
  }, [attributeList, dispatch]);

  const productTypeList = useSelector(selectProductsType);

  useEffect(() => {
    !productTypeList && dispatch(getProductsType());
  }, [productTypeList, dispatch]);

  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      productTypeId: "",
      keyName: "",
      values: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values",
  });

  const onSubmit = async (data: Inputs) => {
    try {
      const res = await axios.post(BASE_URL+"/api/addProductType", data);
      if (res.status === 201) {
        await dispatch(getSubCategories());
        await dispatch(getProductsType());
        form.reset();
        toast.success("Product type added Successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Product Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Product Type
                        </FormLabel>
                        <Popover
                          open={prodTypeOpen}
                          onOpenChange={setProdTypeOpen}
                        >
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
                                  ? productTypeList &&
                                    productTypeList.find(
                                      (client) => `${client.id}` === field.value
                                    )?.productType
                                  : "Select Product Type"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] shadow-lg rounded-md border">
                            <Command>
                              <CommandInput
                                placeholder="Search category..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {productTypeList &&
                                    productTypeList.map((client) => (
                                      <CommandItem
                                        className="capitalize"
                                        value={`${client.id}`}
                                        key={client.id}
                                        onSelect={() => {
                                          form.setValue(
                                            "productTypeId",
                                            `${client.id}`,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                          setAttriOpen(false);
                                        }}
                                      >
                                        {client.productType}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            `${client.id}` === field.value
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
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="keyName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Attribute
                        </FormLabel>
                        <Popover open={attriOpen} onOpenChange={setAttriOpen}>
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
                                  ? attributeList &&
                                    attributeList.find(
                                      (client) =>
                                        `${client.attributeName}` ===
                                        field.value
                                    )?.attributeName
                                  : "Select Attribute"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] shadow-lg rounded-md border">
                            <Command>
                              <CommandInput
                                placeholder="Search category..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {attributeList &&
                                    attributeList.map((client) => (
                                      <CommandItem
                                        className="capitalize"
                                        value={`${client.attributeName}`}
                                        key={client.id}
                                        onSelect={() => {
                                          form.setValue(
                                            "keyName",
                                            `${client.attributeName}`,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                          setAttriOpen(false);
                                        }}
                                      >
                                        {client.attributeName}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            `${client.attributeName}` ===
                                              field.value
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
                <div className="col-span-full flex flex-col gap-3">
                  <div className="space-x-2">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                      Values
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append(" ")}
                      className="w-fit border-green-400 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="shadow-md border-gray-300"
                      onClick={() => {
                        form.setValue("values", [""]);
                      }}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="col-span-full grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`values.${index}`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input type="text" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
        title="Attributes Value"
        desc=""
      />
    </div>
  );
};

export default Attribute;
