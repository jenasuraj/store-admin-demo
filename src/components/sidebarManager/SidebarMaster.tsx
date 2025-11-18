import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Save,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchSidebarAsync,
  selectSidebar,
} from "./sidebarSlice";
import { IconName, IconPicker, IconRenderer } from "@/components/ui/icon-picker";

export interface SubModule {
  subModuleurl?: string;
  id: number;
  subModuleName: string;
  icon: string;
  url?: string;
  parentId?: number;
}

export interface ModuleItem {
  id: number;
  moduleName: string;
  icon: string;
  url?: string;
  subModules: SubModule[];
}

interface ModuleFormData {
  modules: {
    moduleName: string;
    icon: string;
    url?: string;
    parentId?: string;
  }[];
}

const formSchema = z.object({
  modules: z
    .array(
      z.object({
        moduleName: z.string().min(1, "Module name is required"),
        icon: z.string().min(1, "Icon is required"),
        url: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .min(1, "At least one module is required"),
});

// Helper function to separate main modules and sub-modules
function separateModulesAndSubModules(modules) {
  const mainModules = [];
  const subModules = [];

  modules.forEach((module) => {
    if (module.parentId && module.parentId !== "") {
      subModules.push({
        subModuleName: module.moduleName,
        icon: module.icon,
        url: module.url,
        parentId: parseInt(module.parentId),
      });
    } else {
      mainModules.push({
        moduleName: module.moduleName,
        icon: module.icon,
        url: module.url,
        subModules: [],
      });
    }
  });

  return { mainModules, subModules };
}

// Helper function to group sub-modules by parent
function groupSubModulesByParent(subModules) {
  const groupedSubModules = {};

  subModules.forEach((subModule) => {
    if (!groupedSubModules[subModule.parentId]) {
      groupedSubModules[subModule.parentId] = [];
    }
    groupedSubModules[subModule.parentId].push({
      subModuleName: subModule.subModuleName,
      icon: subModule.icon,
      url: subModule.url,
    });
  });

  return groupedSubModules;
}

// Helper function to find parent module ID for a sub-module
function findParentModuleId(
  subModuleId: number,
  moduleData: ModuleItem[]
): number | null {
  for (const module of moduleData) {
    if (module.subModules) {
      for (const subModule of module.subModules) {
        if (subModule.id === subModuleId) {
          return module.id;
        }
      }
    }
  }
  return null;
}

function ModuleForm({
  onSubmit,
  editingItem,
  moduleData,
}: {
  onSubmit: (data: ModuleFormData) => Promise<void>;
  editingItem?: ModuleItem | SubModule | null;
  moduleData: ModuleItem[];
}) {
  const isSubModule = editingItem && "subModuleName" in editingItem;
  const parentModuleId = isSubModule
    ? findParentModuleId(editingItem.id, moduleData)
    : null;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modules: [{ moduleName: "", url: "", icon: "house", parentId: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modules",
  });

  const watchedModules = watch("modules");

  // Auto-fill form when editing
  useEffect(() => {
    if (editingItem) {
      const formData = {
        modules: [
          {
            moduleName: isSubModule
              ? editingItem.subModuleName
              : (editingItem as ModuleItem).moduleName,
            url: isSubModule
              ? (editingItem as SubModule).url ||
                (editingItem as any).subModuleurl ||
                ""
              : (editingItem as ModuleItem).url || "",
            icon: editingItem.icon || "house",
            parentId: isSubModule
              ? parentModuleId
                ? parentModuleId.toString()
                : ""
              : "",
          },
        ],
      };
      reset(formData);
    } else {
      reset({
        modules: [{ moduleName: "", url: "", icon: "house", parentId: "" }],
      });
    }
  }, [editingItem, reset, isSubModule, parentModuleId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingItem ? "Edit Module" : "Add Modules"}</CardTitle>
        <CardDescription>
          {editingItem
            ? `Update the ${isSubModule ? "sub-module" : "module"} details`
            : "Create one or more modules or sub-modules"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 border-b pb-4">
              <div className="space-y-2">
                <Label htmlFor={`modules.${index}.moduleName`}>
                  {isSubModule ? "Sub-Module Name" : "Module Name"}
                </Label>
                <Input
                  id={`modules.${index}.moduleName`}
                  {...register(`modules.${index}.moduleName`)}
                  placeholder={`Enter ${
                    isSubModule ? "sub-module" : "module"
                  } name`}
                />
                {errors.modules?.[index]?.moduleName && (
                  <p className="text-sm text-destructive">
                    {errors.modules[index].moduleName?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`modules.${index}.url`}>
                  URL Path (Optional)
                </Label>
                <Input
                  id={`modules.${index}.url`}
                  {...register(`modules.${index}.url`)}
                  placeholder="/path/to/page"
                />
              </div>

              <div className="flex flex-col justify-center space-y-2 z-99999">
                <Label htmlFor={`modules.${index}.icon`}>Icon</Label>
                <IconPicker
                  value={watchedModules[index]?.icon as IconName}
                  onValueChange={(value) =>
                    setValue(`modules.${index}.icon`, value)
                  }
                  searchable={true}
                  searchPlaceholder="Search icons..."
                  triggerPlaceholder="Select an icon"
                />
                {errors.modules?.[index]?.icon && (
                  <p className="text-sm text-destructive">
                    {errors.modules[index].icon?.message}
                  </p>
                )}
              </div>

              {/* Always show Parent Module select field */}
              <div className="space-y-2">
                <Label htmlFor={`modules.${index}.parent`}>
                  Parent Module (Optional)
                </Label>
                <Select
                  value={watchedModules[index]?.parentId || ""}
                  onValueChange={(value) =>
                    setValue(
                      `modules.${index}.parentId`,
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No Parent (Main Module)
                    </SelectItem>
                    {moduleData?.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        <div className="flex items-center gap-2">
                          <IconRenderer name={item.icon as IconName} />
                          {item.moduleName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!editingItem && fields.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mt-2"
                >
                  Remove Module
                </Button>
              )}
            </div>
          ))}

          {!editingItem && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ moduleName: "", url: "", icon: "house", parentId: "" })
              }
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Module
            </Button>
          )}

          {errors.modules && (
            <p className="text-sm text-destructive">{errors.modules.message}</p>
          )}

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {editingItem ? "Update" : "Add"}{" "}
            {isSubModule ? "Sub-Module" : "Module"}
            {!editingItem && fields.length > 1 ? "s" : ""}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TreeItem({
  item,
  level = 0,
  onEdit,
  onDelete,
}: {
  item: ModuleItem;
  level?: number;
  onEdit: (item: ModuleItem | SubModule) => void;
  onDelete: (id: number, isSubModule?: boolean, parentId?: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.subModules && item.subModules.length > 0;

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        {!hasChildren && <div className="w-6" />}
        <IconRenderer name={item.icon as IconName} />
        <div className="flex-1 min-w-0">
          <div className="truncate">{item.moduleName}</div>
          {item.url && (
            <div className="text-xs text-muted-foreground truncate">
              {item.url}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Module</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{item.moduleName}"? This
                  action cannot be undone.
                  {hasChildren && " All sub-modules will also be deleted."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(item.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {item.subModules!.map((subModule) => (
            <div
              key={subModule.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group"
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
            >
              <div className="w-6" />
              <IconRenderer name={subModule.icon as IconName} />
              <div className="flex-1 min-w-0">
                <div className="truncate">{subModule.subModuleName}</div>
                {subModule.subModuleurl && (
                  <div className="text-xs text-muted-foreground truncate">
                    {subModule.subModuleurl}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onEdit(subModule)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Sub-Module</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "
                        {subModule.subModuleName}"? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(subModule.id, true, item.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModuleTree({
  data,
  onEdit,
  onDelete,
}: {
  data: ModuleItem[];
  onEdit: (item: ModuleItem | SubModule) => void;
  onDelete: (id: number, isSubModule?: boolean, parentId?: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Structure</CardTitle>
        <CardDescription>
          Hierarchical view of your modules and sub-modules. Click to
          expand/collapse or use actions to edit/delete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <div className="space-y-1">
            {data?.map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
export default function SidebarMaster() {
  const [editingItem, setEditingItem] = useState<ModuleItem | SubModule | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const moduleData = useAppSelector(selectSidebar);

  useEffect(() => {
    if (!moduleData) {
      dispatch(fetchSidebarAsync());
    }
  }, [dispatch, moduleData]);

  const handleAddModule = async (formData: ModuleFormData) => {
    setIsLoading(true);

    try {
      const { mainModules, subModules } = separateModulesAndSubModules(
        formData.modules
      );

      // Handle main modules
      if (mainModules.length > 0) {
        console.log("Adding main modules:", mainModules);
        const mainModuleResponse = await axios.post(
          `${BASE_URL}/api/moduleAccess/add`,
          mainModules
        );

        if (mainModuleResponse.status === 200) {
          toast.success(
            `${mainModules.length} main module(s) added successfully`
          );
        }
      }

      // Handle sub-modules
      if (subModules.length > 0) {
        const groupedSubModules = groupSubModulesByParent(subModules);

        // Create payload for sub-modules
        const subModulePayload = Object.keys(groupedSubModules).map(
          (parentId) => ({
            moduleId: parseInt(parentId),
            subModules: groupedSubModules[parentId],
          })
        );

        console.log("Adding sub-modules:", subModulePayload);
        const subModuleResponse = await axios.post(
          `${BASE_URL}/api/moduleAccess/add-submodule`,
          subModulePayload
        );

        if (subModuleResponse.status === 200) {
          toast.success(
            `${subModules.length} sub-module(s) added successfully`
          );
        }
      }

      // Refresh the module data
      dispatch(fetchSidebarAsync());
    } catch (error) {
      console.error("Error adding modules:", error);
      toast.error("Failed to add modules. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModule = async (formData: ModuleFormData) => {
    if (!editingItem) return;

    setIsLoading(true);
    try {
      const { mainModules, subModules } = separateModulesAndSubModules(
        formData.modules
      );
      const isSubModule = "subModuleName" in editingItem;
      const newParentId = formData.modules[0].parentId
        ? parseInt(formData.modules[0].parentId)
        : null;
      const oldParentId = isSubModule
        ? findParentModuleId(editingItem.id, moduleData)
        : null;

      // Handle main module update
      if (!isSubModule && mainModules.length > 0) {
        const mainModulePayload = {
          id: editingItem.id,
          moduleName: mainModules[0].moduleName,
          icon: mainModules[0].icon,
          url: mainModules[0].url || "",
        };

        const mainModuleResponse = await axios.put(
          `${BASE_URL}/api/moduleAccess/update`,
          [mainModulePayload]
        );

        if (mainModuleResponse.status === 200) {
          toast.success("Main module updated successfully");
        }
      }

      // Handle sub-module update
      if (isSubModule && subModules.length > 0) {
        // Prepare payload for both old and new parent modules if parent has changed
        const payload = [];

        // If parent has changed, update both old and new parent modules
        if (oldParentId !== newParentId && oldParentId && newParentId) {
          // Update old parent (remove the sub-module)
          const oldParentModule = moduleData.find(
            (module) => module.id === oldParentId
          );
          if (oldParentModule) {
            const updatedOldSubModules =
              oldParentModule.subModules?.filter(
                (subModule) => subModule.id !== editingItem.id
              ) || [];
            payload.push({
              id: oldParentId,
              moduleName: oldParentModule.moduleName,
              icon: oldParentModule.icon,
              url: oldParentModule.url || "",
              subModules: updatedOldSubModules,
            });
          }

          // Update new parent (add the sub-module)
          const newParentModule = moduleData.find(
            (module) => module.id === newParentId
          );
          if (newParentModule) {
            const updatedNewSubModules = [
              ...(newParentModule.subModules || []),
              {
                id: editingItem.id,
                subModuleName: subModules[0].subModuleName,
                icon: subModules[0].icon,
                url: subModules[0].url || "",
              },
            ];

            payload.push({
              id: newParentId,
              moduleName: newParentModule.moduleName,
              icon: newParentModule.icon,
              url: newParentModule.url || "",
              subModules: updatedNewSubModules,
            });
          }
        } else {
          // If parent hasn't changed, just update the sub-module in its current parent
          const parentModule = moduleData.find(
            (module) => module.id === oldParentId
          );
          if (!parentModule) {
            throw new Error("Parent module not found");
          }

          const updatedSubModules =
            parentModule.subModules?.map((subModule) =>
              subModule.id === editingItem.id
                ? {
                    id: editingItem.id,
                    subModuleName: subModules[0].subModuleName,
                    icon: subModules[0].icon,
                    url: subModules[0].url || "",
                  }
                : subModule
            ) || [];

          payload.push({
            id: oldParentId,
            moduleName: parentModule.moduleName,
            icon: parentModule.icon,
            url: parentModule.url || "",
            subModules: updatedSubModules,
          });
        }

        const subModuleResponse = await axios.put(
          `${BASE_URL}/api/moduleAccess/update-submodules`,
          payload
        );

        if (subModuleResponse.status === 200) {
          toast.success("Sub-module updated successfully");
        }
      }

      // Refresh the module data
      dispatch(fetchSidebarAsync());
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module. Please try again.");
    } finally {
      setIsLoading(false);
      setIsEditDialogOpen(false);
      setEditingItem(null);
    }
  };

  const handleDeleteModule = async (
    id: number,
    isSubModule?: boolean,
    parentId?: number
  ) => {
    setIsLoading(true);
    try {
      // Use the correct endpoints for deleting modules and sub-modules
      const endpoint = isSubModule
        ? `${BASE_URL}/api/moduleAccess/delete-submodule/${id}`
        : `${BASE_URL}/api/moduleAccess/delete-module/${id}`;

      // No data payload is needed based on the provided endpoints
      const response = await axios.delete(endpoint);

      if (response.status === 200) {
        toast.success(
          `${isSubModule ? "Sub-module" : "Module"} deleted successfully`
        );
        dispatch(fetchSidebarAsync());
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: ModuleItem | SubModule) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingItem(null);
    setIsEditDialogOpen(false);
  };

  const totalModules = moduleData?.length || 0;
  const totalSubModules = moduleData?.reduce(
    (acc, module) => acc + (module.subModules?.length || 0),
    0
  );

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Access Manager</h1>
          <p className="text-muted-foreground">
            Create and manage your dynamic module structure
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {totalModules} modules
          </Badge>
          <Badge variant="outline" className="text-sm">
            {totalSubModules} sub-modules
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!editingItem && (
          <ModuleForm
            onSubmit={handleAddModule}
            editingItem={null}
            moduleData={moduleData}
          />
        )}
        {editingItem && !isEditDialogOpen && (
          <ModuleForm
            onSubmit={handleEditModule}
            editingItem={editingItem}
            moduleData={moduleData}
          />
        )}
        <ModuleTree
          data={moduleData}
          onEdit={handleEdit}
          onDelete={handleDeleteModule}
        />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {editingItem && "subModuleName" in editingItem
                ? "Sub-Module"
                : "Module"}
            </DialogTitle>
            <DialogDescription>
              Update the details for this{" "}
              {editingItem && "subModuleName" in editingItem
                ? "sub-module"
                : "module"}
            </DialogDescription>
          </DialogHeader>
          <ModuleForm
            onSubmit={handleEditModule}
            editingItem={editingItem}
            moduleData={moduleData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
