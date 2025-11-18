import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store";
import {
  fetchGrpCompaniesAsync,
  addGrpCompanyAsync,
  updateGrpCompanyAsync,
  selectGrpCompaniesEntity,
  selectGrpCompaniesLoading,
} from "@/app/grpCompaniesSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CompanyMaster() {
  const dispatch = useDispatch<AppDispatch>();
  const companies = useSelector(selectGrpCompaniesEntity);
  const loading = useSelector(selectGrpCompaniesLoading);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  const [formData, setFormData] = useState({
    groupCompanyName: "",
    category: "",
    logoURL: "",
    qrData: "",
    authRequired: false,
    whatsApp: "",
    path: "",
    flowType: "",
    paymentURL: "",
  });

  useEffect(() => {
    dispatch(fetchGrpCompaniesAsync());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, authRequired: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editMode && selectedCompanyId) {
        await dispatch(
          updateGrpCompanyAsync({
            groupCompanyId: selectedCompanyId,
            companyData: {
              groupCompanyName: formData.groupCompanyName,
              logoURL: formData.logoURL,
              authRequired: formData.authRequired,
              whatsApp: formData.whatsApp,
            },
          })
        ).unwrap();
        toast.success("Success", {
          description: "Company updated successfully",
        });
      } else {
        await dispatch(addGrpCompanyAsync(formData)).unwrap();
        toast("Success", {
          description: "Company added successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      dispatch(fetchGrpCompaniesAsync());
    } catch (error) {
      toast("Error", {
        description: "Failed to save company",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      groupCompanyName: "",
      category: "",
      logoURL: "",
      qrData: "",
      authRequired: false,
      whatsApp: "",
      path: "",
      flowType: "",
      paymentURL: "",
    });
    setEditMode(false);
    setSelectedCompanyId(null);
  };

  const handleEdit = (company: any) => {
    setEditMode(true);
    setSelectedCompanyId(company.id);
    setFormData({
      groupCompanyName: company.groupCompanyName,
      category: company.category || "",
      logoURL: company.logoURL || "",
      qrData: company.qrData || "",
      authRequired: company.authRequired || false,
      whatsApp: company.whatsApp || "",
      path: company.path || "",
      flowType: company.flowType || "",
      paymentURL: company.paymentURL || "",
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Group Companies</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Company" : "Add New Company"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupCompanyName">Company Name *</Label>
                  <Input
                    id="groupCompanyName"
                    name="groupCompanyName"
                    value={formData.groupCompanyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {!editMode && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="logoURL">Logo URL</Label>
                  <Input
                    id="logoURL"
                    name="logoURL"
                    value={formData.logoURL}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsApp">WhatsApp</Label>
                  <Input
                    id="whatsApp"
                    name="whatsApp"
                    value={formData.whatsApp}
                    onChange={handleInputChange}
                    placeholder="919876543210"
                  />
                </div>

                {!editMode && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="qrData">QR Data</Label>
                      <Input
                        id="qrData"
                        name="qrData"
                        value={formData.qrData}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="path">Path</Label>
                      <Input
                        id="path"
                        name="path"
                        value={formData.path}
                        onChange={handleInputChange}
                        placeholder="/home"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flowType">Flow Type</Label>
                      <Input
                        id="flowType"
                        name="flowType"
                        value={formData.flowType}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentURL">Payment URL</Label>
                      <Input
                        id="paymentURL"
                        name="paymentURL"
                        value={formData.paymentURL}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="authRequired"
                    checked={formData.authRequired}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="authRequired">Auth Required</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editMode ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !companies ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Auth Required</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies?.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>{company.groupCompanyName}</TableCell>
                    <TableCell>{company.category}</TableCell>
                    <TableCell>
                      {(company as any).authRequired ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
