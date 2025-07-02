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
} from "../Category/categorySlice";
import {
  getProductsType,
  productsError,
  productsLoading,
  selectProductsType,
} from "./productTypeSlice";
import { BASE_URL } from "@/lib/constants";
import ImageUploadModal from "@/Features/Products/Components/ImageUploadModal";

type Inputs = {
  productType: string;
  categoryMappingId: string;
  image : {
    name : string,
    url : string ,
    status : boolean ,
    type : string 
  }
};

const imageSchema = z.object({
  name: z.string().min(1, "Image name is required"),
  url: z.string().url("Please provide a valid image URL"),
  status: z.boolean().default(true),
  type: z.string().min(1, "Image type is required"),
});
const schema = z.object({
  categoryMappingId: z
    .string()
    .trim()
    .min(1, { message: "Category Name is required" }),
  productType: z
    .string()
    .trim()
    .min(1, { message: "Product type name is required" }),

    image : imageSchema

});

const ProductType = () => {
        const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();

  const tableData = useSelector(selectProductsType);
  const tableLoading = useSelector(productsLoading);
  const tableError = useSelector(productsError);

  useEffect(() => {
    !tableData && dispatch(getProductsType());
  }, [tableData, dispatch]);

  const subCategoryList = useSelector(selectSubCategories);

  useEffect(() => {
    !subCategoryList && dispatch(getSubCategories());
  }, [subCategoryList, dispatch]);

  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      productType: "",
      categoryMappingId: "",
    },
  });

  const onSubmit = async (data: Inputs) => {
    console.log(data);
    
    try {
      const res = await axios.post(BASE_URL + "/api/addProductType",
         {
       categoryMappingId :   data.categoryMappingId,
       productType : data.productType,
       imgURL : [data.image]


      });
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
              <div className="grid sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-2">
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="categoryMappingId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Category
                        </FormLabel>
                        <Popover>
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
                                  ? subCategoryList &&
                                    subCategoryList.find(
                                      (client) => `${client.id}` === field.value
                                    )?.categoryName
                                  : "Select Category"}
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
                                  {subCategoryList &&
                                    subCategoryList.map((client) => (
                                      <CommandItem
                                        className="capitalize"
                                        value={`${client.categoryName}`}
                                        key={client.id}
                                        onSelect={() => {
                                          form.setValue(
                                            "categoryMappingId",
                                            `${client.id}`,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                        }}
                                      >
                                        {client.categoryName}
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
                <FormField
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
                />




  <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        Product Type
                      </FormLabel>
                      <FormControl>
                         <Button
                type="button"
                variant="outline"
                onClick={() => setIsImageModalOpen(true)}
                className="w-full"
              >
                Upload Image
              </Button>
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
            <ImageUploadModal
                          isOpen={isImageModalOpen}
                          onClose={() => setIsImageModalOpen(false)}
                          onUpload={(images) => {
                            if (images.length > 0) {
                              const uploadedImage = images[0];
                              form.setValue("image", {
                                name: uploadedImage.img_name,
                                url: uploadedImage.img_url,
                                status: true,
                                type: uploadedImage.img_type
                              });
                            }
                          }}
                        />
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

export default ProductType;