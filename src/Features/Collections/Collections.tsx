import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL, CONTAINER_NAME, FOLDER_NAME } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import debounce from "lodash/debounce";
import ViewCollections from "./Collectiontable";
import { Checkbox } from "@/components/ui/checkboxv1";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { FetchCollectionAsync } from "./collectionSlice";
import {
  getBlobServiceClient,
  ProcessedImage,
} from "../Products/Components/ImageUploadModal";

interface Collection {
  id: number;
  name: string;
  description: string;
  products: number[];
  skus: string[];
  createdAt?: string;
}

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState("create");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [newCollection, setNewCollection] = useState<{
    name: string;
    description: string;
    products: number[];
    skus: string[];
    bannerImage: File | null;
    bannerImageUrl: string | null;
  }>({
    name: "",
    description: "",
    products: [],
    skus: [],
    bannerImage: null,
    bannerImageUrl: null,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useLocation().search;

  const fetchProducts = useCallback(
    async (query: string = "") => {
      if (products.length > 0 && loading) return;
      setLoading(true);
      try {
        const isCollectionSearch = window.location.href.includes("query");
        const url = isCollectionSearch
          ? `${BASE_URL}/api/products/collectionSearch${query}`
          : `${BASE_URL}/api/products/get/filter${query}`;
        const response = await axios.get(url);
        const data = response.data;
        if (response.status === 200) {
          const newProducts = query ? data.content || data : data.content;
          setHasMore(data.last);
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.productId));
            const filteredNewProducts = newProducts.filter(
              (p: any) => !existingIds.has(p.productId)
            );
            return [...prev, ...filteredNewProducts];
          });
          if (!query) {
            //   setPage((prev) => prev + 1);
            //   setHasMore(!data.last);
            // } else {
            //   setHasMore(false); // No pagination for search results
            // }
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore]
  );

  // Handle search with debounce

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    // Delete all keys
    newParams.forEach((_, key) => {
      newParams.delete(key);
    });

    newParams.set("page", `${0}`);
    setSearchParams(newParams);
  }, []);

  useEffect(() => {
    const isCollectionSearch = window.location.href.includes("query");

    if (isCollectionSearch) {
      const params = new URLSearchParams(searchParams);
      params.get("page") == "0" && setProducts([]);
    }
    fetchProducts(params);
  }, [params]);

  const handleCreateCollection = (collection: {
    name: string;
    description: string;
    products: number[];
    skus: string[];
  }) => {
    const newCollectionWithId = {
      ...collection,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCollections([...collections, newCollectionWithId]);
    setNewCollection({
      name: "",
      description: "",
      products: [],
      skus: [],
      bannerImage: null,
      bannerImageUrl: null,
    });
    setActiveTab("view");
  };

  const handleEditCollection = (id: number) => {
    const collection = collections.find((c) => c.id === id);
    if (collection) {
      setEditingCollection(collection);
      setActiveTab("edit");
    }
  };

  const handleUpdateCollection = (updatedCollection: Collection) => {
    setCollections(
      collections.map((c) =>
        c.id === updatedCollection.id ? updatedCollection : c
      )
    );
    setEditingCollection(null);
    setActiveTab("view");
  };

  const handleDeleteCollection = (id: number) => {
    setCollections(collections.filter((c) => c.id !== id));
  };

  return (
    <div className="mx-auto py-8 space-y-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage product collections
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="flex-col flex gap-4 py-4">
            <TabsList className="w-fit h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="view">View</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="create" className="mt-6 space-y-4">
          <CreateCollectionForm
            newCollection={newCollection}
            setNewCollection={setNewCollection}
            onSubmit={handleCreateCollection}
            products={products}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            hasMore={hasMore}
          />
        </TabsContent>

        <TabsContent value="view" className="mt-6 space-y-4">
          <ViewCollections
            collections={collections}
            onEdit={handleEditCollection}
            onDelete={handleDeleteCollection}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-6 space-y-4">
          {editingCollection ? (
            <EditCollectionForm
              collection={editingCollection}
              onUpdate={handleUpdateCollection}
              onCancel={() => {
                setEditingCollection(null);
                setActiveTab("view");
              }}
              products={products}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              loading={loading}
              hasMore={hasMore}
            />
          ) : (
            <EmptyState
              title="No collection selected"
              description="Select a collection from the View tab to edit"
              action={{
                label: "View collections",
                onClick: () => setActiveTab("view"),
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateCollectionForm({
  newCollection,
  setNewCollection,
  onSubmit,
  products,
  searchTerm,
  setSearchTerm,
  loading,
  hasMore,
}: {
  newCollection: {
    name: string;
    description: string;
    products: number[];
    skus: string[];
    bannerImage: File | null;
    bannerImageUrl: string | null;
  };
  setNewCollection: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      products: number[];
      skus: string[];
      bannerImage: File | null;
      bannerImageUrl: string | null;
    }>
  >;
  onSubmit: (collection: {
    name: string;
    description: string;
    products: number[];
    skus: string[];
    bannerImageUrl?: string;
  }) => void;
  products: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  hasMore: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const cardContentRef = useRef(null);
  const params = useLocation().search;
  const dispatch = useAppDispatch();

  const handleScroll = () => {
    if (!cardContentRef.current || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = cardContentRef.current;

    // If scrolled to bottom (with a small buffer)
    if (scrollHeight - scrollTop - clientHeight < 20) {
      loadMoreContent();
    }
  };

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  // Function to load more content
  const loadMoreContent = () => {
    if (loading || hasMore) return;

    const newParams = new URLSearchParams(searchParams);
    const currentPage = parseInt(newParams.get("page") || "0");
    newParams.set("page", `${currentPage + 1}`);
    setSearchParams(newParams);
  };

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const newParams = new URLSearchParams();

      // Set page and size
      newParams.set("page", "0");
      newParams.set("size", "10");

      // Add query if not empty
      if (term.trim()) {
        newParams.set("query", term.trim());
      }

      // Update URL and reset products
      setSearchParams(newParams);
    }, 500),
    [params]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCollection({
        ...newCollection,
        bannerImage: null,
      });
    }
  };

  const uploadToBlob = async (file: File): Promise<ProcessedImage> => {
    try {
      const blobServiceClient = getBlobServiceClient();
      const containerClient =
        blobServiceClient.getContainerClient(CONTAINER_NAME);
      const timestamp = Date.now();

      // Create a safe blob name
      const blobName = `${FOLDER_NAME}/${timestamp}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload the file data
      const uploadResponse = await blockBlobClient.uploadBrowserData(file, {
        blobHTTPHeaders: { blobContentType: file.type },
      });

      if (uploadResponse.errorCode) {
        throw new Error(
          `Upload failed with error: ${uploadResponse.errorCode}`
        );
      }

      // Get the final URL from the blob client
      const img_url = blockBlobClient.url;

      return {
        img_Id: timestamp,
        img_name: file.name,
        img_type: file.type.split("/")[1],
        img_url,
      };
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  useEffect(() => {
    const content = cardContentRef.current;
    if (content) {
      content.addEventListener("scroll", handleScroll);
      return () => content.removeEventListener("scroll", handleScroll);
    }
  }, [loading]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // First upload the file if one exists
      let bannerImageData = null;

      if (newCollection.bannerImage) {
        bannerImageData = await uploadToBlob(newCollection.bannerImage);
        if (!bannerImageData) {
          toast.error("Failed to upload banner image");
          setIsSubmitting(false);
          return;
        }
      }

      const formattedSkus = newCollection.skus
        .map((sku) => {
          const product = products.find((p) =>
            p.attributes.some((attr) => attr.sku === sku)
          );
          return {
            productId: product ? product.productId : null,
            sku: sku,
          };
        })
        .filter((item) => item.productId !== null);

      const collectionData = {
        collectionName: newCollection.name,
        description: newCollection.description,
        bannerImage: bannerImageData?.img_url || "", // Add the banner image URL
        bannerImageId: bannerImageData?.img_Id || "", // You may want to store the image ID as well
        skus: formattedSkus,
      };
      const response = await axios.post(
        `${BASE_URL}/api/collections/add`,
        collectionData
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Collection created successfully!", {
          description: `${newCollection.name} has been added.`,
        });
        dispatch(FetchCollectionAsync());
        onSubmit({
          name: newCollection.name,
          description: newCollection.description,
          bannerImageUrl: bannerImageData?.img_url || "",
          products: newCollection.products,
          skus: newCollection.skus,
        });
      }
    } catch (error) {
      toast.error("Failed to create collection", {
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      });
      console.error("Error creating collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
            <CardDescription>
              Enter the basic information for your new collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">Collection Name</label>
              <Input
                id="name"
                placeholder="Enter collection name"
                value={newCollection.name}
                onChange={(e) =>
                  setNewCollection({
                    ...newCollection,
                    name: e.target.value,
                    bannerImage: null,
                    bannerImageUrl: null,
                  })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                placeholder="Enter collection description"
                className="min-h-[120px] resize-none"
                value={newCollection.description}
                onChange={(e) =>
                  setNewCollection({
                    ...newCollection,
                    description: e.target.value,
                    bannerImageUrl: null,
                    bannerImage: null,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bannerImage">Banner Image</label>
              <Input
                id="bannerImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="h-10"
              />
              {newCollection.bannerImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Selected: {newCollection.bannerImage.name}
                  </p>
                </div>
              )}
              {newCollection.bannerImageUrl && (
                <div className="mt-2">
                  <img
                    src={newCollection.bannerImageUrl}
                    alt="Banner preview"
                    className="max-h-40 rounded-md"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                !newCollection.name ||
                newCollection.skus.length === 0 ||
                isSubmitting
              }
            >
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Items</CardTitle>
            <CardDescription>
              {newCollection.skus.length} SKUs selected from{" "}
              {newCollection.products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {newCollection.skus.length > 0 ? (
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-4">
                  {newCollection.products.map((productId) => {
                    const product = products.find(
                      (p) => p.productId === productId
                    );
                    if (!product) return null;

                    const selectedSkusForProduct = product.attributes.filter(
                      (attr) => newCollection.skus.includes(attr.sku)
                    );

                    if (selectedSkusForProduct.length === 0) return null;

                    return (
                      <div key={product.productId} className="space-y-2">
                        <div className="font-medium">{product.name}</div>
                        <div className="pl-4 space-y-1">
                          {selectedSkusForProduct.map((attr) => (
                            <div
                              key={attr.sku}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {attr.color && (
                                  <div
                                    className="w-3 h-3 rounded-full border"
                                    style={{
                                      backgroundColor: `#${
                                        attr.color.split("-")[1]
                                      }`,
                                    }}
                                  />
                                )}
                                <span>
                                  {attr.color?.split("-")[0]} / {attr.size}
                                  {attr.fit && ` / ${attr.fit}`}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {attr.sku}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] border rounded-md bg-muted/10">
                <div className="text-muted-foreground text-center">
                  <p>No items selected</p>
                  <p className="text-sm mt-1">
                    Select products and SKUs from the right panel
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Select Products</CardTitle>
            <CardDescription>
              Choose products and SKUs to include in this collection
            </CardDescription>
          </CardHeader>
          <CardContent
            ref={cardContentRef}
            className="p-0 max-h-[500px] overflow-y-auto"
          >
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 h-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <ProductSelector
              products={products}
              searchTerm={searchTerm}
              selectedProducts={newCollection.products}
              selectedSkus={newCollection.skus}
              onProductSelect={(productId) => {
                const isSelected = newCollection.products.includes(productId);
                if (isSelected) {
                  setNewCollection({
                    ...newCollection,
                    products: newCollection.products.filter(
                      (id) => id !== productId
                    ),
                    skus: newCollection.skus.filter((sku) => {
                      const product = products.find(
                        (p) => p.productId === productId
                      );
                      return !product?.attributes.some(
                        (attr) => attr.sku === sku
                      );
                    }),
                  });
                } else {
                  setNewCollection({
                    ...newCollection,
                    products: [...newCollection.products, productId],
                  });
                }
              }}
              onSkuSelect={(sku, productId) => {
                const isSelected = newCollection.skus.includes(sku);
                if (isSelected) {
                  setNewCollection({
                    ...newCollection,
                    skus: newCollection.skus.filter((s) => s !== sku),
                  });
                } else {
                  const updatedProducts = newCollection.products.includes(
                    productId
                  )
                    ? newCollection.products
                    : [...newCollection.products, productId];
                  setNewCollection({
                    ...newCollection,
                    products: updatedProducts,
                    skus: [...newCollection.skus, sku],
                  });
                }
              }}
              onSelectAllSkus={(productId, skus, isSelected) => {
                if (isSelected) {
                  setNewCollection({
                    ...newCollection,
                    products: newCollection.products.filter(
                      (id) => id !== productId
                    ),
                    skus: newCollection.skus.filter(
                      (sku) => !skus.includes(sku)
                    ),
                  });
                } else {
                  const updatedProducts = newCollection.products.includes(
                    productId
                  )
                    ? newCollection.products
                    : [...newCollection.products, productId];
                  const newSkus = [
                    ...new Set([...newCollection.skus, ...skus]),
                  ];
                  setNewCollection({
                    ...newCollection,
                    products: updatedProducts,
                    skus: newSkus,
                  });
                }
              }}
              loading={loading}
              hasMore={hasMore}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductSelector({
  products,
  searchTerm,
  selectedProducts,
  selectedSkus,
  onProductSelect,
  onSkuSelect,
  onSelectAllSkus,
  loading,
  hasMore,
}: {
  products: any[];
  searchTerm: string;
  selectedProducts: number[];
  selectedSkus: string[];
  onProductSelect: (productId: number) => void;
  onSkuSelect: (sku: string, productId: number) => void;
  onSelectAllSkus: (
    productId: number,
    skus: string[],
    isSelected: boolean
  ) => void;
  loading: boolean;
  hasMore: boolean;
}) {
  const [expandedProducts, setExpandedProducts] = useState<number[]>([]);
  const { ref, inView } = useInView();
  const [lastFetchTime, setLastFetchTime] = useState(0); // To throttle infinite scroll

  const toggleProductExpand = (productId: number) => {
    if (expandedProducts.includes(productId)) {
      setExpandedProducts(expandedProducts.filter((id) => id !== productId));
    } else {
      setExpandedProducts([...expandedProducts, productId]);
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (
      inView &&
      hasMore &&
      !loading &&
      !searchTerm && // Only fetch more when not searching
      now - lastFetchTime > 1000 // Throttle to once per second
    ) {
      // fetchProducts(`${products.length / 10)}`; // Approximate page based on current product count
      setLastFetchTime(now);
    }
  }, [inView, hasMore, loading, searchTerm, products.length, lastFetchTime]);

  const areAllSkusSelected = (productId: number) => {
    const product = products.find((p) => p.productId === productId);
    if (!product) return false;
    return product.attributes.every((attr: any) =>
      selectedSkus.includes(attr.sku)
    );
  };

  const areSomeSkusSelected = (productId: number) => {
    const product = products.find((p) => p.productId === productId);
    if (!product) return false;
    return (
      product.attributes.some((attr: any) => selectedSkus.includes(attr.sku)) &&
      !product.attributes.every((attr: any) => selectedSkus.includes(attr.sku))
    );
  };

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 z-20">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                className="left-0"
                checked={
                  selectedProducts.length === products.length
                    ? true
                    : selectedProducts.length === 0
                    ? false
                    : "indeterminate"
                }
                onCheckedChange={(value) => {
                  if (value) {
                    products.forEach((product) => {
                      onProductSelect(product.productId);
                      product.attributes.forEach((attr: any) => {
                        onSkuSelect(attr.sku, product.productId);
                      });
                    });
                  } else {
                    products.forEach((product) => {
                      onProductSelect(product.productId);
                      product.attributes.forEach((attr: any) => {
                        onSkuSelect(attr.sku, product.productId);
                      });
                    });
                  }
                }}
                aria-label="Select all products"
              />
            </TableHead>
            <TableHead className="hidden md:table-cell">Product</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Variants</TableHead>
            <TableHead className="hidden md:table-cell">Default SKU</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <React.Fragment key={product.productId}>
                <TableRow className="group hover:bg-muted/50 ">
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`product-${product.productId}`}
                        checked={areAllSkusSelected(product.productId)}
                        onCheckedChange={() => {
                          const allSkus = product.attributes.map(
                            (attr: any) => attr.sku
                          );
                          onSelectAllSkus(
                            product.productId,
                            allSkus,
                            areAllSkusSelected(product.productId)
                          );
                        }}
                        className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                      />
                      <button
                        onClick={() => toggleProductExpand(product.productId)}
                        className="p-1 rounded-sm hover:bg-muted"
                      >
                        {expandedProducts.includes(product.productId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {product.attributes[0]?.imgs?.[0]?.img_url ? (
                          <img
                            src={product.attributes[0]?.imgs?.[0]?.img_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.subheading}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2">
                    <Badge
                      variant="outline"
                      className={`${
                        product.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2">
                    {product.attributes.length} variants
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2">
                    <Badge variant="secondary" className="font-mono">
                      {product.defaultSku}
                    </Badge>
                  </TableCell>
                </TableRow>

                {expandedProducts.includes(product.productId) && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0 border-t-0">
                      <div className="bg-muted/20 py-2">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="w-[50px]"></TableHead>
                              <TableHead>Variant</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Stock</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {product.attributes.map((attr: any) => (
                              <TableRow
                                key={attr.sku}
                                className="hover:bg-muted/50 border-b-0"
                              >
                                <TableCell className="py-2">
                                  <Checkbox
                                    id={`sku-${attr.sku}`}
                                    checked={selectedSkus.includes(attr.sku)}
                                    onCheckedChange={() =>
                                      onSkuSelect(attr.sku, product.productId)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="flex items-center gap-2">
                                    {attr.color && (
                                      <div
                                        className="w-4 h-4 rounded-full border"
                                        style={{
                                          backgroundColor: `#${
                                            attr.color.split("-")[1]
                                          }`,
                                        }}
                                      />
                                    )}
                                    <span>
                                      {attr.color?.split("-")[0]} / {attr.size}
                                      {attr.fit && ` / ${attr.fit}`}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 font-mono text-sm">
                                  {attr.sku}
                                </TableCell>
                                <TableCell className="py-2">
                                  ₹{attr.price}
                                </TableCell>
                                <TableCell className="py-2">
                                  <span
                                    className={`${
                                      attr.quantity < 20
                                        ? "text-red-600"
                                        : attr.quantity < 50
                                        ? "text-amber-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {attr.quantity} in stock
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}

          {loading && (
            <TableRow>
              <TableCell colSpan={5} className="h-24">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading more products...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!searchTerm && (
            <TableRow ref={ref}>
              <TableCell colSpan={5} className="h-1 p-0"></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function EditCollectionForm({
  collection,
  onUpdate,
  onCancel,
  products,
  searchTerm,
  setSearchTerm,
  loading,
  hasMore,
}: {
  collection: Collection;
  onUpdate: (collection: Collection) => void;
  onCancel: () => void;
  products: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  hasMore: boolean;
}) {
  const [editedCollection, setEditedCollection] = useState<Collection>({
    ...collection,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Collection</CardTitle>
            <CardDescription>
              Update the details for "{collection.name}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name">Collection Name</label>
              <Input
                id="edit-name"
                placeholder="Enter collection name"
                value={editedCollection.name}
                onChange={(e) =>
                  setEditedCollection({
                    ...editedCollection,
                    name: e.target.value,
                  })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description">Description</label>
              <Textarea
                id="edit-description"
                placeholder="Enter collection description"
                className="min-h-[120px] resize-none"
                value={editedCollection.description}
                onChange={(e) =>
                  setEditedCollection({
                    ...editedCollection,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={() => onUpdate(editedCollection)}
              disabled={
                !editedCollection.name || editedCollection.skus.length === 0
              }
            >
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Items</CardTitle>
            <CardDescription>
              {editedCollection.skus.length} SKUs selected from{" "}
              {editedCollection.products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editedCollection.skus.length > 0 ? (
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-4">
                  {editedCollection.products.map((productId) => {
                    const product = products.find(
                      (p) => p.productId === productId
                    );
                    if (!product) return null;

                    const selectedSkusForProduct = product.attributes.filter(
                      (attr) => editedCollection.skus.includes(attr.sku)
                    );

                    if (selectedSkusForProduct.length === 0) return null;

                    return (
                      <div key={product.productId} className="space-y-2">
                        <div className="font-medium">{product.name}</div>
                        <div className="pl-4 space-y-1">
                          {selectedSkusForProduct.map((attr) => (
                            <div
                              key={attr.sku}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {attr.color && (
                                  <div
                                    className="w-3 h-3 rounded-full border"
                                    style={{
                                      backgroundColor: `#${
                                        attr.color.split("-")[1]
                                      }`,
                                    }}
                                  />
                                )}
                                <span>
                                  {attr.color?.split("-")[0]} / {attr.size}
                                  {attr.fit && ` / ${attr.fit}`}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {attr.sku}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] border rounded-md bg-muted/10">
                <div className="text-muted-foreground text-center">
                  <p>No items selected</p>
                  <p className="text-sm mt-1">
                    Select products and SKUs from the right panel
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Select Products</CardTitle>
            <CardDescription>
              Choose products and SKUs to include in this collection
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ProductSelector
              products={products}
              searchTerm={searchTerm}
              selectedProducts={editedCollection.products}
              selectedSkus={editedCollection.skus}
              onProductSelect={(productId) => {
                const isSelected =
                  editedCollection.products.includes(productId);
                if (isSelected) {
                  setEditedCollection({
                    ...editedCollection,
                    products: editedCollection.products.filter(
                      (id) => id !== productId
                    ),
                    skus: editedCollection.skus.filter((sku) => {
                      const product = products.find(
                        (p) => p.productId === productId
                      );
                      return !product?.attributes.some(
                        (attr) => attr.sku === sku
                      );
                    }),
                  });
                } else {
                  setEditedCollection({
                    ...editedCollection,
                    products: [...editedCollection.products, productId],
                  });
                }
              }}
              onSkuSelect={(sku, productId) => {
                const isSelected = editedCollection.skus.includes(sku);
                if (isSelected) {
                  setEditedCollection({
                    ...editedCollection,
                    skus: editedCollection.skus.filter((s) => s !== sku),
                  });
                } else {
                  const updatedProducts = editedCollection.products.includes(
                    productId
                  )
                    ? editedCollection.products
                    : [...editedCollection.products, productId];
                  setEditedCollection({
                    ...editedCollection,
                    products: updatedProducts,
                    skus: [...editedCollection.skus, sku],
                  });
                }
              }}
              onSelectAllSkus={(productId, skus, isSelected) => {
                if (isSelected) {
                  setEditedCollection({
                    ...editedCollection,
                    products: editedCollection.products.filter(
                      (id) => id !== productId
                    ),
                    skus: editedCollection.skus.filter(
                      (sku) => !skus.includes(sku)
                    ),
                  });
                } else {
                  const updatedProducts = editedCollection.products.includes(
                    productId
                  )
                    ? editedCollection.products
                    : [...editedCollection.products, productId];
                  const newSkus = [
                    ...new Set([...editedCollection.skus, ...skus]),
                  ];
                  setEditedCollection({
                    ...editedCollection,
                    products: updatedProducts,
                    skus: newSkus,
                  });
                }
              }}
              loading={loading}
              hasMore={hasMore}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action && (
          <Button variant="outline" className="mt-4" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
