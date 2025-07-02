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
import {
  getParentCategories,
  getSubCategories,
  selectCategories,
  selectSubCategories,
  subCategoriesError,
  subCategoriesLoading,
} from "./categorySlice";
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
import { GrPowerReset } from "react-icons/gr";
import { BASE_URL } from "@/lib/constants";
import ImageUploadModal from "@/Features/Products/Components/ImageUploadModal";

type Inputs = {
  parentId: string;
  parentCategoryName: string;
  subcategoryName: string;
  subCategoryImage : {
    name:string,
    url :string,
    status: boolean ,
    type:string
  }
};

const Category = () => {
      const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const categoryList = useSelector(selectCategories);
  const subCategoryList = useSelector(selectSubCategories);
  const tableLoading = useSelector(subCategoriesLoading);
  const tableError = useSelector(subCategoriesError);
  useEffect(() => {
    !categoryList && dispatch(getParentCategories());
  }, [categoryList, dispatch]);

  useEffect(() => {
    !subCategoryList && dispatch(getSubCategories());
  }, [subCategoryList, dispatch]);

  const imageSchema = z.object({
      name: z.string().min(1, "Image name is required"),
  url: z.string().url("Please provide a valid image URL"),
  status: z.boolean().default(true),
  type: z.string().min(1, "Image type is required"),
  })

  const form = useForm<Inputs>({
    resolver: async (values, context, options) => {
      const schema = z.object({
        parentId: z
          .string()
          .trim()
          .min(1, { message: "Parent Category is required" }),
        subcategoryName: z
          .string()
          .trim()
          .min(1, { message: "Category Name is required" }),

          subCategoryImage : imageSchema
      });
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: {
      parentId: "",
      parentCategoryName: "",
      subcategoryName: "",
       subCategoryImage : {
    name: "",
    url : "",
    status: true ,
    type: ""
  }
    },
  });

 const onSubmit = async (data: Inputs) => {
  console.log(data, "data");
  
    try {
      const res = await axios.post(
        BASE_URL + "/api/categories/addSubcategory",
        data.parentCategoryName
          ? {
              parentCategoryName: data.parentCategoryName,
              subcategoryName: data.subcategoryName,
              imgURL :[ data.subCategoryImage]
            }
          : {
              parentCategoryName: data.parentId,
              subcategoryName: data.subcategoryName,
              imgURL : [data.subCategoryImage]
            }
      );
      if (res.status === 201) {
        form.reset();
        await dispatch(getParentCategories());
        await dispatch(getSubCategories());
        toast.success("Sub Category Added Successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };


  // console.log(form.getValues('subCategoryImage'));
  
  return (
    <div className="flex flex-col gap-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-2">
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Parent Category
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
                                  ? categoryList &&
                                    categoryList.find(
                                      (client) =>
                                        `${client.categoryName}` === field.value
                                    )?.categoryName
                                  : "Select Parent Category"}
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
                                  {categoryList &&
                                    categoryList.map((client) => (
                                      <CommandItem
                                        className="capitalize"
                                        value={`${client.categoryName}`}
                                        key={client.id}
                                        onSelect={() => {
                                          form.setValue(
                                            "parentId",
                                            `${client.categoryName}`,
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
                                            `${client.categoryName}` ===
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
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="parentCategoryName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <div className="flex items-end justify-between">
                          <FormLabel>Category</FormLabel>
                          <GrPowerReset
                            className="text-xs"
                            onClick={() =>
                              form.setValue("parentCategoryName", "")
                            }
                          />
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={!form.watch("parentId")}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between capitalize",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {!form.watch("parentId")
                                  ? "Choose parent category first"
                                  : field.value
                                  ? subCategoryList &&
                                    subCategoryList.find(
                                      (client) =>
                                        `${client.categoryName}` === field.value
                                    )?.categoryName
                                  : "Select sub Category"}
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
                                <CommandEmpty>
                                  No sub category found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {subCategoryList &&
                                    subCategoryList.map((client) => (
                                      <CommandItem
                                        className="capitalize"
                                        value={`${client.categoryName}`}
                                        key={client.categoryId}
                                        onSelect={() => {
                                          form.setValue(
                                            "parentCategoryName",
                                            `${client.categoryName}`,
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
                                            `${client.categoryName}` ===
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
                <FormField
                  control={form.control}
                  name="subcategoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        New Category
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="enter new category name"
                          className={`${
                            form.formState.errors.subcategoryName &&
                            "focus-visible:ring-red-500"
                          }`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />








 <FormField
                  control={form.control}
                  name="subCategoryImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        Image
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
                    form.setValue("subCategoryImage", {
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
        data={subCategoryList}
        COLUMNS={Columns}
        loading={tableLoading}
        error={tableError}
        title="Category"
        desc=""
      />
    </div>
  );
};

export default Category;
