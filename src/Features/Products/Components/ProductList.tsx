import { useEffect, useState } from "react";
import { HeaderActions } from "./header-actions";
import ProductTable from "./Productable";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { ProductResponse } from "./type";
import { Pagination } from "./pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProductList() {
  const [product, setProduct] = useState<ProductResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("active");
  const navigate = useNavigate();
  const params = useLocation().search;

  const fetchProducts = async (attribute: string) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/products/get/filter${attribute}`
      );

      if (res.status === 200) {
        setProduct(res.data.content);
        setTotalPages(res.data.totalPages);
      } else {
        console.error("Unexpected response status:", res.status);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    navigate({
      search: `status=${status}&page=${currentPage}&size=${pageSize}`,
    });
  }, [currentPage, pageSize, status]);

  useEffect(() => {
    fetchProducts(params);
  }, [params]);

 

  return (
    <div className="p-8 w-full max-w-[100vw] bg-white mx-auto">
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" onClick={() => setStatus("active")}>
            Active
          </TabsTrigger>
          <TabsTrigger value="draft" onClick={() => setStatus("draft")}>
            Draft
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
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
                <ProductTable products={product} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="draft">
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
                <ProductTable products={product} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
