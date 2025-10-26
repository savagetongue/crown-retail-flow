import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import ProductFinder from "@/components/billing/ProductFinder";
import InvoiceCart from "@/components/billing/InvoiceCart";
import CustomerInfo from "@/components/billing/CustomerInfo";

export type CartItem = {
  product_id: string;
  name: string;
  sku: string;
  unit_price: number;
  qty: number;
  discount_amount: number;
  line_total: number;
};

export type CustomerData = {
  name: string;
  phone: string;
  location_id: string;
  notes: string;
};

export default function InvoiceBuilder() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    phone: "",
    location_id: "",
    notes: "",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-accent" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Create a new sales transaction
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Product Finder</h2>
            <ProductFinder cart={cart} setCart={setCart} />
          </Card>

          <Card className="p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Cart</h2>
            <InvoiceCart cart={cart} setCart={setCart} />
          </Card>
        </div>

        <div className="space-y-6">
          <CustomerInfo
            customer={customer}
            setCustomer={setCustomer}
            cart={cart}
            onClearCart={() => setCart([])}
          />
        </div>
      </div>
    </div>
  );
}
