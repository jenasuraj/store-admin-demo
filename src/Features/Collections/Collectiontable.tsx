import { useEffect, useState } from "react";
import { collectionType } from "./type";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Eye, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./Collections";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  collectionData,
  collectionError,
  collectionLoading,
  FetchCollectionAsync,
} from "./collectionSlice";
import ShadcnTable from "@/components/shadcnTable/ShadcnTable";
import { columns } from "./column";

export default function ViewCollections({
  collections,
  onEdit,
  onDelete,
}: {
  collections: collectionType[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();

  const data = useAppSelector(collectionData);
  const loading = useAppSelector(collectionLoading);
  const error = useAppSelector(collectionError);

  useEffect(() => {
    !data && dispatch(FetchCollectionAsync());
  }, [data]);

  return (
    // <div className="space-y-6">
    //   <Card>
    //     <CardHeader className="pb-3">
    //       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    //         <div>
    //           <CardTitle>All Collections</CardTitle>
    //           <CardDescription>
    //             {data?.length || 0} total collections
    //           </CardDescription>
    //         </div>
    //         <div className="relative w-full md:w-auto">
    //           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    //           <Input
    //             placeholder="Search collections..."
    //             className="pl-8 w-full md:w-[300px]"
    //             value={searchTerm}
    //             onChange={(e) => setSearchTerm(e.target.value)}
    //           />
    //         </div>
    //       </div>
    //     </CardHeader>
    //     <CardContent className="p-0">
    //       {data?.length === 0 ? (
    //         <EmptyState
    //           title="No collections yet"
    //           description="Create your first collection to get started"
    //           action={{
    //             label: "Create collection",
    //             onClick: () => document.getElementById("create-tab")?.click(),
    //           }}
    //         />
    //       ) : data?.length === 0 ? (
    //         <div className="flex flex-col items-center justify-center py-12 px-4">
    //           <div className="text-center space-y-2">
    //             <h3 className="text-lg font-medium">No results found</h3>
    //             <p className="text-sm text-muted-foreground">
    //               No collections match your search criteria
    //             </p>
    //           </div>
    //         </div>
    //       ) : (
    //         <Table>
    //           <TableHeader className="bg-muted/50">
    //             <TableRow>
    //               <TableHead>Name</TableHead>
    //               <TableHead className="hidden md:table-cell">
    //                 Description
    //               </TableHead>
    //               <TableHead>Products</TableHead>
    //               <TableHead className="hidden md:table-cell">SKUs</TableHead>
    //               <TableHead className="hidden md:table-cell">
    //                 Created
    //               </TableHead>
    //               <TableHead className="text-right">Actions</TableHead>
    //             </TableRow>
    //           </TableHeader>
    //           <TableBody>
    //             {data?.map((collection) => (
    //               <TableRow key={collection.id} className="group">
    //                 <TableCell className="font-medium">
    //                   {collection?.collectionName}
    //                 </TableCell>
    //                 <TableCell className="hidden md:table-cell max-w-[300px] truncate">
    //                   {collection?.description}
    //                 </TableCell>
    //                 <TableCell>{collection?.skus?.length}</TableCell>
    //                 <TableCell className="hidden md:table-cell">
    //                   {collection?.skus.length}
    //                 </TableCell>
    //                 <TableCell className="hidden md:table-cell">
    //                   {collection?.createdAt
    //                     ? new Date(collection?.createdAt).toLocaleDateString()
    //                     : new Date().toLocaleDateString()}
    //                 </TableCell>
    //                 <TableCell className="text-right">
    //                   <div className="flex items-center justify-end gap-2">
    //                     <TooltipProvider>
    //                       <Tooltip>
    //                         <TooltipTrigger asChild>
    //                           <Button
    //                             variant="ghost"
    //                             size="icon"
    //                             // onClick={() => onEdit(collection.id)}
    //                             className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
    //                           >
    //                             <Edit className="h-4 w-4" />
    //                             <span className="sr-only">Edit</span>
    //                           </Button>
    //                         </TooltipTrigger>
    //                         <TooltipContent>
    //                           <p>Edit collection</p>
    //                         </TooltipContent>
    //                       </Tooltip>
    //                     </TooltipProvider>

    //                     <DropdownMenu>
    //                       <DropdownMenuTrigger asChild>
    //                         <Button
    //                           variant="ghost"
    //                           size="icon"
    //                           className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
    //                         >
    //                           <MoreHorizontal className="h-4 w-4" />
    //                           <span className="sr-only">More options</span>
    //                         </Button>
    //                       </DropdownMenuTrigger>
    //                       <DropdownMenuContent align="end">
    //                         <DropdownMenuItem
    //                         //   onClick={() => onEdit(collection.id)}
    //                         >
    //                           <Edit className="h-4 w-4 mr-2" />
    //                           Edit
    //                         </DropdownMenuItem>
    //                         <DropdownMenuItem>
    //                           <Eye className="h-4 w-4 mr-2" />
    //                           View details
    //                         </DropdownMenuItem>
    //                         <DropdownMenuSeparator />
    //                         <DropdownMenuItem
    //                           className="text-red-600 focus:text-red-600"
    //                           //   onClick={() => onDelete(collection.id)}
    //                         >
    //                           <Trash2 className="h-4 w-4 mr-2" />
    //                           Delete
    //                         </DropdownMenuItem>
    //                       </DropdownMenuContent>
    //                     </DropdownMenu>
    //                   </div>
    //                 </TableCell>
    //               </TableRow>
    //             ))}
    //           </TableBody>
    //         </Table>
    //       )}
    //     </CardContent>
    //   </Card>

    <div>
      <ShadcnTable
        title="Collections"
        columns={columns}
        data={data || []}
        loading={loading}
        error={error}
      />
    </div>
  );
}
