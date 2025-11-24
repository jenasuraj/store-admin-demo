import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { X, Edit, Eye, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createCustomer,
  uploadAadhar,
  deleteAadhar,
  resetCustomerState,
  fetchCustomers,
  updateCustomer,
} from "@/app/customerSlice";
import { Progress } from "@/components/ui/progress";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useBlocker, useBeforeUnload } from "react-router-dom";
import { DialogTrigger } from "@radix-ui/react-dialog";

const customerSchema = z.object({
  firstname: z.string().min(1, "Name is required"),
  number: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(10, "Mobile number must be exactly 10 digits")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  address: z.string().min(1, "Address is required"),
  aadharCard: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomerForm() {
  const dispatch = useAppDispatch();
  const { customers, loading } = useAppSelector((state) => state.customer);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  if (loading && customers.length === 0) {
    return <div className="text-center py-8">Loading customers...</div>;
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-start">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {customers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No customers added yet
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Aadhar</TableHead>
                    <TableHead className="w-12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell className="font-medium">
                        {customer.firstname}
                      </TableCell>
                      <TableCell>{customer.number}</TableCell>
                      <TableCell>{customer.address}</TableCell>
                      <TableCell>
                        {customer.aadharCard ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden group cursor-pointer">
                            <Dialog>
                              <DialogTrigger>
                                <img
                                  src={customer.aadharCard}
                                  alt="Aadhar"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    {" "}
                                    {customer.firstname}'s Aadhar Card
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="w-full h-full">
                                  <img
                                    src={customer.aadharCard}
                                    alt="Aadhar Full"
                                    className="w-full max-w-7xl max-h-[80vh] object-contain"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No Image
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCustomer(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        modal={false}
        open={isCreating}
        onOpenChange={(open) => !open && setIsCreating(false)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          {isCreating && (
            <CreateCustomerForm
              onSuccess={() => setIsCreating(false)}
              onCancel={() => setIsCreating(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <EditCustomerForm
              customer={editingCustomer}
              onSuccess={() => setEditingCustomer(null)}
              onCancel={() => setEditingCustomer(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateCustomerForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();
  const { loading, uploadProgress, uploadedAadharUrl, isUploading } =
    useAppSelector((state) => state.customer);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstname: "",
      number: "",
      address: "",
      aadharCard: "",
    },
  });

  // Sync uploaded URL with form
  useEffect(() => {
    if (uploadedAadharUrl) {
      form.setValue("aadharCard", uploadedAadharUrl);
    }
  }, [uploadedAadharUrl, form]);

  // Navigation Protection
  const isDirty = form.formState.isDirty || !!uploadedAadharUrl;
  const isSubmitting = form.formState.isSubmitting || loading;

  useBeforeUnload(
    useCallback(
      (e) => {
        if (isDirty && !isSubmitting) {
          e.preventDefault();
          e.returnValue = "";
        }
      },
      [isDirty, isSubmitting]
    )
  );

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !isSubmitting &&
      currentLocation.pathname !== nextLocation.pathname
  );

  const handleDrop = (files: File[]) => {
    if (files.length > 0) {
      dispatch(uploadAadhar(files[0]));
    }
  };

  const handleDeleteImage = () => {
    if (uploadedAadharUrl) {
      dispatch(deleteAadhar(uploadedAadharUrl));
    }
    form.setValue("aadharCard", "");
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelAlert(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = async () => {
    if (uploadedAadharUrl) {
      await dispatch(deleteAadhar(uploadedAadharUrl));
    }
    dispatch(resetCustomerState());
    setShowCancelAlert(false);
    onCancel();
  };

  const onSubmit = async (data: CustomerFormValues) => {
    const resultAction = await dispatch(
      createCustomer({
        firstname: data.firstname,
        number: data.number,
        address: data.address,
        aadharCard: uploadedAadharUrl || data.aadharCard || "",
      })
    );

    if (createCustomer.fulfilled.match(resultAction)) {
      dispatch(resetCustomerState());
      dispatch(fetchCustomers());
      onSuccess();
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Aadhar Card</Label>
            {!form.getValues("aadharCard") && !uploadedAadharUrl ? (
              <div className="space-y-4">
                <Dropzone
                  onDrop={handleDrop}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                  maxFiles={1}
                  disabled={isUploading}
                >
                  <>
                    <DropzoneEmptyState />
                  </>
                  <DropzoneContent />
                </Dropzone>
                {isUploading && (
                  <div className="w-full">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full max-w-xs aspect-video border rounded-lg overflow-hidden group bg-muted">
                <img
                  src={uploadedAadharUrl || form.getValues("aadharCard")}
                  alt="Aadhar Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 justify-end">
            <Button type="button" variant="outline" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isUploading}>
              {loading ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelAlert(false)}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {blocker.state === "blocked" && (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to leave? Any
                uploaded files will be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => blocker.reset()}>
                Stay
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (uploadedAadharUrl) {
                    await dispatch(deleteAadhar(uploadedAadharUrl));
                  }
                  dispatch(resetCustomerState());
                  blocker.proceed();
                }}
              >
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

function EditCustomerForm({
  customer,
  onSuccess,
  onCancel,
}: {
  customer: any;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();
  const { loading, uploadProgress, uploadedAadharUrl, isUploading } =
    useAppSelector((state) => state.customer);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstname: customer.firstname,
      number: customer.number,
      address: customer.address,
      aadharCard: customer.aadharCard || "",
    },
  });

  // Sync uploaded URL with form
  useEffect(() => {
    if (uploadedAadharUrl) {
      form.setValue("aadharCard", uploadedAadharUrl);
    }
  }, [uploadedAadharUrl, form]);

  // Navigation Protection
  const isDirty = form.formState.isDirty || !!uploadedAadharUrl;
  const isSubmitting = form.formState.isSubmitting || loading;

  useBeforeUnload(
    useCallback(
      (e) => {
        if (isDirty && !isSubmitting) {
          e.preventDefault();
          e.returnValue = "";
        }
      },
      [isDirty, isSubmitting]
    )
  );

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !isSubmitting &&
      currentLocation.pathname !== nextLocation.pathname
  );

  const handleDrop = (files: File[]) => {
    if (files.length > 0) {
      dispatch(uploadAadhar(files[0]));
    }
  };

  const handleDeleteImage = (isUpload: boolean) => {
    if (uploadedAadharUrl || isUpload) {
      dispatch(deleteAadhar(form.getValues("aadharCard")));
      form.setValue("aadharCard", "");
    } else if (customer.aadharCard) {
      form.setValue("aadharCard", "");
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelAlert(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = async () => {
    if (uploadedAadharUrl) {
      await dispatch(deleteAadhar(uploadedAadharUrl));
    }
    dispatch(resetCustomerState());
    setShowCancelAlert(false);
    onCancel();
  };

  const onSubmit = async (data: CustomerFormValues) => {
    const resultAction = await dispatch(
      updateCustomer({
        id: customer.customerId,
        data: {
          firstname: data.firstname,
          number: data.number,
          address: data.address,
          aadharCard: uploadedAadharUrl || data.aadharCard || "",
        },
      })
    );

    if (updateCustomer.fulfilled.match(resultAction)) {
      dispatch(resetCustomerState());
      dispatch(fetchCustomers());
      onSuccess();
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Aadhar Card</Label>
            {!form.getValues("aadharCard") && !uploadedAadharUrl ? (
              <div className="space-y-4">
                <Dropzone
                  onDrop={handleDrop}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                  maxFiles={1}
                  disabled={isUploading}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
                {isUploading && (
                  <div className="w-full">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full max-w-xs aspect-video border rounded-lg overflow-hidden group bg-muted">
                <img
                  src={uploadedAadharUrl || form.getValues("aadharCard")}
                  alt="Aadhar Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(true)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 justify-end">
            <Button type="button" variant="outline" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isUploading}>
              {loading ? "Updating..." : "Update Customer"}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelAlert(false)}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {blocker.state === "blocked" && (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to leave? Any
                uploaded files will be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => blocker.reset()}>
                Stay
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (uploadedAadharUrl) {
                    await dispatch(deleteAadhar(uploadedAadharUrl));
                  }
                  dispatch(resetCustomerState());
                  blocker.proceed();
                }}
              >
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
