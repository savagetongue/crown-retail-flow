import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { CustomerData, CartItem } from "@/pages/billing/InvoiceBuilder";
import { useToast } from "@/hooks/use-toast";

type CustomerInfoProps = {
  customer: CustomerData;
  setCustomer: (customer: CustomerData) => void;
  cart: CartItem[];
  onClearCart: () => void;
};

export default function CustomerInfo({
  customer,
  setCustomer,
  cart,
  onClearCart,
}: CustomerInfoProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_locations")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (cart.length === 0) throw new Error("Cart is empty");
      if (!customer.location_id) throw new Error("Please select a location");

      const { data, error } = await supabase.rpc("create_invoice", {
        p_created_by: "00000000-0000-0000-0000-000000000000", // System user
        p_location_id: customer.location_id,
        p_customer_name: customer.name || "Walk-in Customer",
        p_customer_phone: customer.phone || "",
        p_items: cart.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
        })),
        p_discount_percent: 0,
        p_discount_amount: 0,
        p_notes: customer.notes || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Invoice created successfully!" });
      onClearCart();
      if (data && data[0]) {
        navigate(`/billing/invoices/${data[0].invoice_id}`);
      } else {
        navigate("/billing/invoices");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const subtotal = cart.reduce((sum, item) => sum + item.line_total, 0);
  const tax = 0; // Tax calculation can be added here
  const total = subtotal + tax;

  return (
    <Card className="p-6 rounded-2xl space-y-6 sticky top-24">
      <div>
        <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Customer Name</Label>
            <Input
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
              placeholder="Walk-in Customer"
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
              placeholder="Optional"
            />
          </div>

          <div>
            <Label>Location *</Label>
            <Select
              value={customer.location_id}
              onValueChange={(value) =>
                setCustomer({ ...customer, location_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={customer.notes}
              onChange={(e) =>
                setCustomer({ ...customer, notes: e.target.value })
              }
              placeholder="Optional notes"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-accent">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          size="lg"
          disabled={cart.length === 0 || !customer.location_id || createInvoiceMutation.isPending}
          onClick={() => createInvoiceMutation.mutate()}
        >
          {createInvoiceMutation.isPending ? "Creating..." : "Finalize & Generate Invoice"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onClearCart}
          disabled={cart.length === 0}
        >
          Clear Cart
        </Button>
      </div>
    </Card>
  );
}
