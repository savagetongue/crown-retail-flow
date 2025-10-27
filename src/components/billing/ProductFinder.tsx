import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/pages/billing/InvoiceBuilder";

type ProductFinderProps = {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
};

export default function ProductFinder({ cart, setCart }: ProductFinderProps) {
  const [search, setSearch] = useState("");

  // Get the CROWN location
  const { data: defaultLocation } = useQuery({
    queryKey: ["default-location"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_locations")
        .select("id")
        .eq("name", "CROWN - The Premium Mens Wear")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products-finder", search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_stock(quantity, reserved, location_id)
        `)
        .eq("active", true)
        .order("name");

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
      } else {
        query = query.limit(10);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true,
  });

  const getAvailableStock = (product: any) => {
    if (!product.product_stock || product.product_stock.length === 0 || !defaultLocation) return 0;
    const stock = product.product_stock.find((s: any) => s.location_id === defaultLocation.id);
    return stock ? stock.quantity - stock.reserved : 0;
  };

  const addToCart = (product: any) => {
    const availableStock = getAvailableStock(product);
    
    if (availableStock <= 0) {
      // Show error toast if using toast
      alert(`Product "${product.name}" is out of stock!`);
      return;
    }

    const existing = cart.find((item) => item.product_id === product.id);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty >= availableStock) {
      alert(`Only ${availableStock} units available for "${product.name}"`);
      return;
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
                line_total: item.unit_price * (item.qty + 1) - item.discount_amount,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          unit_price: Number(product.mrp),
          qty: 1,
          discount_amount: 0,
          line_total: Number(product.mrp),
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {products?.map((product) => {
          const availableStock = getAvailableStock(product);
          const isOutOfStock = availableStock <= 0;
          const isLowStock = availableStock > 0 && availableStock <= 5;
          
          return (
            <div
              key={product.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isOutOfStock ? 'opacity-50 bg-muted/30' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {product.name}
                  {isLowStock && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                      Low Stock
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  SKU: {product.sku} • {formatCurrency(Number(product.mrp))} • Stock: {availableStock}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
