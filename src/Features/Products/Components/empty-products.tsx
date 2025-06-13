import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

export default function EmptyProducts() {
  return (
    <div className="max-w-7xl max-sm:max-w-screen-sm mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 max-w-lg">
          <h1 className="text-2xl font-semibold tracking-tight">
            Add your products
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start by stocking your store with products your customers will love
          </p>
          <div className="mt-6 flex gap-4">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add product
            </Button>
          </div>
        </div>

        {/* Decorative product grid */}
        <div className="grid grid-cols-2  gap-4 w-full max-w-[400px]">
          <div className="aspect-square  bg-gray-100 rounded-lg p-4">
            <div className="relative w-full h-full">
              <img
                src="/product-add.svg"
                alt="Decorative sunglasses"
                className="object-contain mx-auto w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
