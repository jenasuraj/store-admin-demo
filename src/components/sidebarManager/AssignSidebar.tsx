import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Users,
  MapPin,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchGrpCompaniesAsync,
  selectGrpCompaniesEntity,
} from "@/app/grpCompaniesSlice";
import {
  fetchCompaniesAsync,
  selectCompaniesEntity,
} from "@/app/companySlice";
import {
  fetchBranchCompaniesAsync,
  selectBranchCompaniesEntity,
} from "@/app/branchCompanySlice";
import { fetchSidebarAsync, Module, selectSidebar } from "./sidebarSlice";

import { Checkbox } from "@/components/ui/checkbox";
import { IconName, IconRenderer } from "@/components/ui/icon-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubModule } from "./SidebarMaster";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const schema = z.object({
  type: z.string().min(1, "Type is required"),
  id: z.string().min(1, "ID is required"),
  moduleMappings: z.array(
    z.object({
      moduleId: z.number().min(1, "Module ID is required"),
      subModuleIds: z.array(z.number()),
    })
  ),
});

export type ModuleMapping = {
  moduleId: number;
  subModuleIds: number[];
};

type FormValues = z.infer<typeof schema>;

export default function AssignSidebar() {
  const dispatch = useAppDispatch();

  const grpData = useAppSelector(selectGrpCompaniesEntity);
  const companiesData = useAppSelector(selectCompaniesEntity);
  const branchCompaniesData = useAppSelector(selectBranchCompaniesEntity);
  const sidebar = useAppSelector(selectSidebar);

  useEffect(() => {
    !grpData && dispatch(fetchGrpCompaniesAsync());
    !companiesData && dispatch(fetchCompaniesAsync());
    !branchCompaniesData && dispatch(fetchBranchCompaniesAsync());
    !sidebar && dispatch(fetchSidebarAsync());
  }, [grpData, companiesData, branchCompaniesData, sidebar, dispatch]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
      type: "company",
      moduleMappings: [], // Ensure valid ModuleMapping objects
    },
  });

  const onModuleToggle = (moduleId: number, checked: boolean) => {
    const currentMappings = form.getValues("moduleMappings");
    if (checked) {
      // Add module if not already present
      if (!currentMappings.some((m) => m.moduleId === moduleId)) {
        form.setValue("moduleMappings", [
          ...currentMappings,
          { moduleId, subModuleIds: [] },
        ]);
      }
    } else {
      // Remove module and its submodules
      form.setValue(
        "moduleMappings",
        currentMappings.filter((m) => m.moduleId !== moduleId)
      );
    }
  };

  const onSubModuleToggle = (
    moduleId: number,
    subModuleId: number,
    checked: boolean
  ) => {
    const currentMappings = form.getValues("moduleMappings");
    let updatedMappings = currentMappings.map((mapping) => {
      if (mapping.moduleId === moduleId) {
        if (checked) {
          // Add subModuleId if not already present
          return {
            ...mapping,
            subModuleIds: [...mapping.subModuleIds, subModuleId].filter(
              (id, index, self) => self.indexOf(id) === index // Remove duplicates
            ),
          };
        } else {
          // Remove subModuleId
          return {
            ...mapping,
            subModuleIds: mapping.subModuleIds.filter(
              (id) => id !== subModuleId
            ),
          };
        }
      }
      return mapping;
    });

    // Add module if it doesn't exist and we're adding a submodule
    if (checked && !updatedMappings.some((m) => m.moduleId === moduleId)) {
      updatedMappings = [
        ...updatedMappings,
        { moduleId, subModuleIds: [subModuleId] },
      ];
    }

    // Filter out mappings with empty subModuleIds (optional, to keep data clean)
    updatedMappings = updatedMappings.filter(
      (m) => m.subModuleIds.length > 0 || isModuleChecked(m.moduleId)
    );

    form.setValue("moduleMappings", updatedMappings);
  };

  // Helper to check if module is checked (for cleanup logic)
  const isModuleChecked = (moduleId: number) => {
    return form
      .getValues("moduleMappings")
      .some((m) => m.moduleId === moduleId);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await axios.post(BASE_URL + "/api/moduleAccess/assign", {
        ...values,
        id: Number(values.id),
      });
      if (res.status === 200) {
        form.reset();
        toast.success("Modules assigned successfully");
      }
    } catch (error) {
      toast.error("Failed to assign modules");
    }
  };

  const fetchData = async (id: string) => {
    const res = await axios.get(
      BASE_URL + "/api/moduleAccess/group-company/" + id
    );
    if (res.status === 200) {
      const data = res.data;
      form.setValue("moduleMappings", data);
    }
  };

  const handleSelectAll = () => {
    const newMappings: ModuleMapping[] = sidebar.map((module) => ({
      moduleId: module.id,
      subModuleIds: module.subModules.map((sub) => sub.id),
    }));
    form.setValue("moduleMappings", newMappings);
  };

  const getSelectedCount = () => {
    let count = form.getValues("moduleMappings").length;
    form.getValues("moduleMappings").forEach((mapping) => {
      count += mapping.subModuleIds.length;
    });
    return count;
  };

  const getTotalModuleCount = () => {
    let count = sidebar.length;
    sidebar.forEach((module) => {
      if (module.subModules) {
        count += module.subModules.length;
      }
    });
    return count;
  };

  const getProgressPercentage = () => {
    return (getSelectedCount() / getTotalModuleCount()) * 100;
  };

  const handleClearAll = () => {
    form.setValue("moduleMappings", []);
  };

  return (
    <div className="p-3 space-y-8">
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Module Assignment Configuration
              </CardTitle>
              <CardDescription className="text-base">
                Select an entity and configure module access permissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8 h-screen overflow-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium">Company</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="groupcompany">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium">
                                  Group Company
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="branch">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="font-medium">Branch</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`Select ${form.watch("type")}`}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            fetchData(value);
                          }}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${form.watch("type")}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {form.watch("type") === "company"
                              ? companiesData?.map((data) => (
                                  <SelectItem
                                    key={data.id}
                                    value={`${data.id}`}
                                  >
                                    <div className="flex items-center gap-3 py-1">
                                      <Building2 className="h-4 w-4" />
                                      <span className="font-medium">
                                        {data.companyName}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              : form.watch("type") === "groupcompany"
                              ? grpData?.map((data) => (
                                  <SelectItem
                                    key={data.id}
                                    value={`${data.id}`}
                                  >
                                    <div className="flex items-center gap-3 py-1">
                                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      <span className="font-medium">
                                        {data.groupCompanyName}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              : form.watch("type") === "branch"
                              ? branchCompaniesData?.map((data) => (
                                  <SelectItem
                                    key={data.id}
                                    value={`${data.id}`}
                                  >
                                    <div className="flex items-center gap-3 py-1">
                                      <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                      <span className="font-medium">
                                        {data.branchName}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              : null}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Selection Status
                  </FormLabel>
                  <div className="h-9 justify-center items-center gap-3 p-1 px-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    {form.watch("id") ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                          {form.watch("type") === "company" ? (
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : form.watch("type") === "groupcompany" ? (
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : form.watch("type") === "branch" ? (
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : null}
                        </div>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          {form.watch("type") === "company"
                            ? companiesData?.find(
                                (e) => `${e.id}` === form.watch("id")
                              )?.companyName
                            : form.watch("type") === "groupcompany"
                            ? grpData?.find(
                                (e) => `${e.id}` === form.watch("id")
                              )?.groupCompanyName
                            : form.watch("type") === "branch"
                            ? branchCompaniesData?.find(
                                (e) => `${e.id}` === form.watch("id")
                              )?.branchName
                            : ""}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No selection made
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="my-2" />

              {form.watch("id") && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Sidebar Modules
                      </h3>
                      <p className="text-muted-foreground">
                        Select the modules you want to display in the sidebar
                        for this entity
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-sm px-3 py-1"
                          >
                            {getSelectedCount()} / {getTotalModuleCount()}{" "}
                            selected
                          </Badge>
                        </div>
                        <Progress
                          value={getProgressPercentage()}
                          className="w-32 h-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          type="button"
                          className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950 bg-transparent"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearAll}
                          type="button"
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950 
                          bg-transparent"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[500px] w-full">
                <div className="space-y-1">
                  {sidebar?.map((item) => (
                    <TreeItem
                      key={item.id}
                      item={item}
                      level={0}
                      moduleMappings={
                        form.watch("moduleMappings") as ModuleMapping[]
                      }
                      onModuleToggle={onModuleToggle}
                      onSubModuleToggle={onSubModuleToggle}
                    />
                  ))}
                </div>
              </ScrollArea>
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

interface TreeItemProps {
  item: Module;
  level: number;
  moduleMappings: ModuleMapping[];
  onModuleToggle: (moduleId: number, checked: boolean) => void;
  onSubModuleToggle: (
    moduleId: number,
    subModuleId: number,
    checked: boolean
  ) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  moduleMappings,
  onModuleToggle,
  onSubModuleToggle,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.subModules.length > 0;

  // Check if module is selected in moduleMappings
  const isModuleChecked = moduleMappings.some((m) => m.moduleId === item.id);

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}
        <Checkbox
          checked={isModuleChecked}
          onCheckedChange={(checked) => onModuleToggle(item.id, !!checked)}
        />
        <IconRenderer name={item.icon as IconName} />
        <div className="flex-1 min-w-0">
          <div className="truncate">{item.moduleName}</div>
          {item.url && (
            <div className="text-xs text-muted-foreground truncate">
              {item.url}
            </div>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="pl-4">
          {item.subModules.map((subModule) => (
            <div
              key={subModule.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50"
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
            >
              <div className="w-6" /> {/* Placeholder for alignment */}
              <Checkbox
                checked={moduleMappings
                  .find((m) => m.moduleId === item.id)
                  ?.subModuleIds.includes(subModule.id)}
                onCheckedChange={(checked) =>
                  onSubModuleToggle(item.id, subModule.id, !!checked)
                }
              />
              <IconRenderer name={subModule.icon as IconName} />
              <div className="truncate">{subModule.subModuleName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
