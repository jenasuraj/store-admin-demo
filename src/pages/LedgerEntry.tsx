import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PriceList, getPriceLists, getCustomers, Customer, PriceListProduct, initializeDemoData } from '@/lib/storage';
import { ArrowLeft, ShoppingCart, LayoutGrid, LayoutList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EntryModal } from '@/components/ledger/EntryModal';

type ViewMode = 'small-cards' | 'large-cards' | 'list';

export default function EntriesPage() {
  const navigate = useNavigate();
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('small-cards');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeDemoData();
    const lists = getPriceLists();
    setPriceLists(lists);
  }, []);

  if (!mounted) return null;

  // Get all products from all price lists
  const allProducts = priceLists?.slice(0,1)?.flatMap(list => 
    list?.products?.map(product => ({
      ...product,
      priceListId: list.id,
      priceListName: list.name
    }))
  );

  const handleProductSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectedProductsList = allProducts?.filter(p => 
    selectedProducts.has(p?.id)
  );

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Entry</h1>
          <p className="text-muted-foreground">Select products to create a new ledger entry</p>
        </div>

        {priceLists.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Please add products first
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold mb-3 block">View Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'small-cards' ? 'default' : 'outline'}
                    onClick={() => setViewMode('small-cards')}
                    className="gap-2"
                    size="sm"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Small Cards
                  </Button>
                  <Button
                    variant={viewMode === 'large-cards' ? 'default' : 'outline'}
                    onClick={() => setViewMode('large-cards')}
                    className="gap-2"
                    size="sm"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Large Cards
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className="gap-2"
                    size="sm"
                  >
                    <LayoutList className="w-4 h-4" />
                    List
                  </Button>
                </div>
              </div>
            </div>

            <div className='max-w-7xl pb-20'>
              <Label className="text-base font-semibold mb-3 block">Select Products</Label>
              {viewMode === 'list' ? (
                // List view
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid gap-0 border-collapse">
                    {allProducts.map((product, idx) => (
                      <div
                        key={product.id}
                        className={`flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedProducts.has(product.id) ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                        } ${idx === allProducts.length - 1 ? 'border-b-0' : ''}`}
                        onClick={() => handleProductSelect(product.id)}
                      >
                        <div className="flex-shrink-0">
                          <Badge variant={selectedProducts.has(product.id) ? 'default' : 'secondary'}>
                            {selectedProducts.has(product.id) ? '✓' : ''}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.height}H × {product.width}W | Sq Ft: {product.sqft} 
                            {/* {product.priceListName} */}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-semibold">₹{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : viewMode === 'large-cards' ? (
                // Large cards view
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allProducts.map(product => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all ${
                        selectedProducts.has(product.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => handleProductSelect(product.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.height}H × {product.width}W
                            </p>
                            {/* <p className="text-xs text-muted-foreground mt-1">
                              {product.priceListName}
                            </p> */}
                          </div>
                          <Badge variant={selectedProducts.has(product.id) ? 'default' : 'secondary'}>
                            {selectedProducts.has(product.id) ? '✓' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-2 border-t pt-4">
                          <p className="text-muted-foreground">
                            Sq Ft: <span className="font-semibold text-foreground">{product.sqft}</span>
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            Rate: ₹{product.price}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Small cards view (default)
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allProducts.length && allProducts?.map(product => (
                    <Card
                      key={product?.id}
                      className={`cursor-pointer transition-all ${
                        selectedProducts.has(product?.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => handleProductSelect(product.id)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm">{product?.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {product?.height}H × {product?.width}W
                            </p>
                          </div>
                          <Badge variant={selectedProducts.has(product?.id) ? 'default' : 'secondary'} className="text-xs">
                            {selectedProducts.has(product?.id) ? '✓' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-muted-foreground">
                            Sq Ft: <span className="font-semibold">{product?.sqft}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Rate: <span className="font-semibold text-blue-600">₹{product?.price}</span>
                          </p>
                          {/* <p className="text-muted-foreground mt-2">
                            {product.priceListName}
                          </p> */}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {selectedProductsList.length > 0 && (
              <div className="fixed inset-x-0 bottom-0 flex justify-center pb-8">
                <Button
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="gap-2 shadow-lg rounded-full px-20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Create Entry ({selectedProductsList.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <EntryModal
          products={selectedProductsList}
          onClose={() => {
            setShowModal(false);
            setSelectedProducts(new Set());
          }}
        />
      )}
    </main>
  );
}
