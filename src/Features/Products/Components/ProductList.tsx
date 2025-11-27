import { useEffect, useState } from "react";
import { HeaderActions } from "./header-actions";
import ProductTable from "./Productable";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { Product, PaginatedResponse } from "./type";
import { Pagination } from "./pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProductList() {
  // Store the current list of products being displayed
  const [products, setProducts] = useState<Product[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20); 
  
  // Filter State
  const [status, setStatus] = useState("active");
  
  const navigate = useNavigate();
  const location = useLocation();

  // Unified fetch function that handles pagination and status
  const fetchProducts = async () => {
    try {
      // Construct URL with pagination parameters
      const url = `${BASE_URL}/api/products?status=${status}&page=${currentPage}&size=${pageSize}`;
      
      const res = await axios.get<PaginatedResponse<Product>>(url);

      if (res.status === 200) {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
        // Optional: Update total elements if you display counts
        // setTotalElements(res.data.totalElements); 
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchProducts();
    
    // Update URL params for shareability (optional)
    navigate({
      search: `?status=${status}&page=${currentPage}&size=${pageSize}`,
    });
  }, [currentPage, pageSize, status]);

  // Handle Tab Change
  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(0); // Reset to first page when switching tabs
  };

  const updateStatus = async (productId: number, newStatus: string) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/products/updateStatus/${productId}?status=${newStatus}`
      );

      if (res.status === 200) {
        // Remove the item from the current view immediately (Optimistic UI)
        // or re-fetch data. Removing is smoother for pagination.
        setProducts((prev) => prev.filter((p) => p.productId !== productId));
        
        // Optionally refetch to ensure pagination count is correct
        // fetchProducts(); 
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-8 w-full max-w-[100vw] bg-white mx-auto">
      <Tabs value={status} onValueChange={handleTabChange} defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        {/* We can use a single content block since the structure is identical, 
            just the data changes based on state */}
        <TabsContent value={status}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-semibold flex-col justify-center items-center">
                    <span>Products</span>
                  </h1>
                  <span>Here is List of Product</span>
                </div>
                <HeaderActions />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProductTable products={products} onStatusChange={updateStatus} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}