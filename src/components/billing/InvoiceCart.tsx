import { CartItem } from "@/pages/billing/InvoiceBuilder";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InvoiceCartProps = {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
};

export default function InvoiceCart({ cart, setCart }: InvoiceCartProps) {
  const updateQty = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              qty: newQty,
              line_total: item.unit_price * newQty - item.discount_amount,
            }
          : item
      )
    );
  };

  const updateDiscount = (productId: string, discount: number) => {
    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              discount_amount: discount,
              line_total: item.unit_price * item.qty - discount,
            }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cart is empty. Add products from the finder above.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Total</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cart.map((item) => (
          <TableRow key={item.product_id}>
            <TableCell>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.sku}</div>
              </div>
            </TableCell>
            <TableCell>{formatCurrency(item.unit_price)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => updateQty(item.product_id, item.qty - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{item.qty}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => updateQty(item.product_id, item.qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.discount_amount}
                onChange={(e) =>
                  updateDiscount(item.product_id, parseFloat(e.target.value) || 0)
                }
                className="w-24"
              />
            </TableCell>
            <TableCell className="font-semibold">
              {formatCurrency(item.line_total)}
            </TableCell>
            <TableCell>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeItem(item.product_id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
