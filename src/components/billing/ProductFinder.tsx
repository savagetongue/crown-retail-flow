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

  const { data: products } = useQuery({
    queryKey: ["products-finder", search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
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

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.product_id === product.id);
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
        {products?.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">
                SKU: {product.sku} • {formatCurrency(Number(product.mrp))}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToCart(product)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
