import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, Upload, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeaderActions() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4">
      {/* <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm">
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button> 
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            More actions
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Delete selected</DropdownMenuItem>
          <DropdownMenuItem>Update status</DropdownMenuItem>
          <DropdownMenuItem>Edit inventory</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      <Button size="sm" onClick={() => navigate("/product/add")}>
        <Plus className="w-4 h-4 mr-2" />
        Add product
      </Button>
    </div>
  );
}
