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
import { Columns } from "./Columns";
import { getAttributes, selectAttribute } from "../Attribute/attributeSlice";
import {
  attributesValueError,
  attributeValuesLoading,
  getAttributeValues,
  selectAttributeValues,
} from "./attributeValuesSlice";
import { ChromePicker, SketchPicker } from "react-color";
import { BASE_URL } from "@/lib/constants";

type Inputs = {
  keyAttributeId: string;
  value: any[];
};
const schema = z.object({
  keyAttributeId: z.string().min(1, { message: "Attribute is mandatory" }),
  value: z
    .array(z.string().trim().min(1, "Value cannot be empty"))
    .min(1, "At least one value is required"),
});
const AttributeValues = () => {
  const dispatch = useDispatch<AppDispatch>();

  const tableData = useSelector(selectAttributeValues);

  useEffect(() => {
    !tableData && dispatch(getAttributeValues());
  }, [tableData, dispatch]);

  const filteredData = tableData?.map((d) => ({
    ...d,
    keyValues: d.value?.map((v) => v)?.toString(),
  }));

  const [valueOfAttribute,setValueOfAttribute]= useState('')
  const tableLoading = useSelector(attributeValuesLoading);
  const tableError = useSelector(attributesValueError);
  const [attriOpen, setAttriOpen] = useState(false);
  const [colorValues, setColorValues] = useState<string[]>([]);
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean[]>([]);

  const handleChange = (newColor: any, index: number) => {
    const newColorValues = [...colorValues];
    newColorValues[index] = newColor.hex;
    setColorValues(newColorValues);
  };

  const handleAppend = () => {
    append(" ");
    setColorValues([...colorValues, "#000"]);
    setColorPickerVisible([...colorPickerVisible, false]);
  };

  const handleRemove = (index: number) => {
    remove(index);
    setColorValues(colorValues.filter((_, i) => i !== index));
    setColorPickerVisible(colorPickerVisible.filter((_, i) => i !== index));
  };

  const toggleColorPicker = (index: number) => {
    const newColorPickerVisible = [...colorPickerVisible];
    newColorPickerVisible[index] = !newColorPickerVisible[index];
    setColorPickerVisible(newColorPickerVisible);
  };

  const attributeList = useSelector(selectAttribute);

  useEffect(() => {
    !attributeList && dispatch(getAttributes());
  }, [attributeList, dispatch]);

  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      keyAttributeId: "",
      value: [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "value",
  });

  const onSubmit = async (data: Inputs) => {
    // const updatedValues = data.value.map((value, index) => {
    //   if (valueOfAttribute === "color") {
    //     return `${value}-${colorValues[index].slice(1)}`; //* To make a value like this => 'Black-000' as # is not supported while passing parameters in URL
    //   }
    //   return value;
    // });

    const updatedData = {
      ...data,
      value: data.value,
    };
console.log(updatedData);
 

    try {
      const res = await axios.post(BASE_URL + "/api/addValues", updatedData);
      if (res.status === 201) {
        await dispatch(getAttributeValues());
        form.reset();
        toast.success("Values added Successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Values</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="keyAttributeId"
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
                                    (client) => `${client.id}` === field.value
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
                                            "keyAttributeId",
                                            `${client.id}`,
                                            {
                                              shouldValidate: true,
                                            }
                                          )
                                          setValueOfAttribute(client.attributeName)
                                          ;
                                          form.setValue("value", []);
                                          setAttriOpen(false);
                                        }}
                                      >
                                        {client.attributeName}
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
                <div className="col-span-full flex flex-col gap-3">
                  <div className="space-x-2">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                      Values
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!form.watch("keyAttributeId")}
                      onClick={handleAppend}
                      className="w-fit border-green-400 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!form.watch("keyAttributeId")}
                      className="shadow-md border-gray-300"
                      onClick={() => {
                        form.setValue("value", [""]);
                      }}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="col-span-full grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className={cn(
                          form.watch("keyAttributeId") != "1"
                            ? "flex gap-2"
                            : "grid grid-cols-6 gap-2"
                        )}
                      >
                        {form.watch("keyAttributeId") != "1" ? (
                          <FormField
                            control={form.control}
                            name={`value.${index}`}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <>
                            <FormField
                              control={form.control}
                              name={`value.${index}`}
                              render={({ field }) => (
                                <FormItem className="col-span-3">
                                  <FormControl>
                                    <Input type="text" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                         {/* { valueOfAttribute == 'color' ?  <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="z-20 col-span-2 w-full"
                                  onClick={() => toggleColorPicker(index)}
                                >
                                  <div
                                    className="relative w-5/6 h-4/6 rounded-sm "
                                    style={{
                                      backgroundColor: colorValues[index],
                                    }}
                                  />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="bg-transparent shadow-none border-none p-0">
                                <ChromePicker
                                  color={colorValues[index]}
                                  onChange={(color) =>
                                    handleChange(color, index)
                                  }
                                />
                              </PopoverContent>
                            </Popover> : null} */}
                          </>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          onClick={() => handleRemove(index)}
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
        data={filteredData}
        COLUMNS={Columns}
        loading={tableLoading}
        error={tableError}
        title="Attributes Value"
        desc=""
      />
    </div>
  );
};

export default AttributeValues;