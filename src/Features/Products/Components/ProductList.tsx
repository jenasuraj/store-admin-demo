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


interface ProductTableProps {
  products?: ProductResponse[];
  onStatusChange?: (productId: number, newStatus: string) => void;
}

export default function ProductList() {
  const [product, setProduct] = useState<ProductResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("active");
  const navigate = useNavigate();
  const params = useLocation().search;
  const [activeProducts, setActiveProducts] = useState<ProductResponse[]>([]);
  const [draftProducts, setDraftProducts] = useState<ProductResponse[]>([]);


  const fetchProducts = async (attribute: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products${attribute}`);

      if (res.status === 200) {
        setProduct(res.data);
        setTotalPages(1);
        console.log(res.data, " response dataaaa......")
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchActiveProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products?status=active`);
      if (res.status === 200) setActiveProducts(res.data);
    } catch (error) {
      console.error("Error fetching active products:", error);
    }
  };

  const fetchDraftProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products?status=draft`);
      if (res.status === 200) setDraftProducts(res.data);
    } catch (error) {
      console.error("Error fetching draft products:", error);
    }
  };

  useEffect(() => {
    fetchActiveProducts();
    fetchDraftProducts();
  }, []);


  useEffect(() => {
    navigate({
      search: `status=${status}&page=${currentPage}&size=${pageSize}`,
    });
  }, [currentPage, pageSize, status]);

  useEffect(() => {
    fetchProducts(params);
    console.log(params, " paramsssssssss")
  }, [params]);


  const updateStatus = async (productId: number, newStatus: string) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/products/updateStatus/${productId}?status=${newStatus}`
      );

      if (res.status === 200) {
        if (newStatus === "draft") {
          // remove from active & add to draft
          setActiveProducts(prev => prev.filter(p => p.productId !== productId));
          setDraftProducts(prev => [...prev, res.data]); // assuming API returns updated product
        } else if (newStatus === "active") {
          // remove from draft & add to active
          setDraftProducts(prev => prev.filter(p => p.productId !== productId));
          setActiveProducts(prev => [...prev, res.data]);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  return (
    <div className="p-8 w-full max-w-[100vw] bg-white mx-auto">

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active
          </TabsTrigger>
          <TabsTrigger value="draft">
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
                {/* <ProductTable products={product} /> */}
                <ProductTable products={activeProducts} onStatusChange={updateStatus} />

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
                <ProductTable products={draftProducts} onStatusChange={updateStatus} />
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
