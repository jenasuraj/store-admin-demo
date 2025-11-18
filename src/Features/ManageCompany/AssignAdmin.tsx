import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store";
import {
  fetchGrpCompaniesAsync,
  createAdminAsync,
  selectGrpCompaniesEntity,
  selectGrpCompaniesLoading,
} from "@/app/grpCompaniesSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AssignAdmin() {
  const dispatch = useDispatch<AppDispatch>();
  const companies = useSelector(selectGrpCompaniesEntity);
  const loading = useSelector(selectGrpCompaniesLoading);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    groupCompanyId: "",
  });

  useEffect(() => {
    dispatch(fetchGrpCompaniesAsync());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, groupCompanyId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.groupCompanyId) {
      toast.error("Error", { description: "Please select a company" });
      return;
    }

    try {
      await dispatch(
        createAdminAsync({
          username: formData.username,
          password: formData.password,
          groupCompanyId: parseInt(formData.groupCompanyId),
        })
      ).unwrap();

      toast.success("Success", { description: "Admin created successfully" });

      setFormData({
        username: "",
        password: "",
        groupCompanyId: "",
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to create admin",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create Admin</h2>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupCompanyId">Select Company *</Label>
              <Select
                value={formData.groupCompanyId}
                onValueChange={handleCompanyChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.groupCompanyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password"
                minLength={7}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
