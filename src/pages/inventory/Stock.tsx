import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import StockAdjustDialog from "@/components/stock/StockAdjustDialog";

export default function Stock() {
  const [adjustDialog, setAdjustDialog] = useState<{
    open: boolean;
    stock: any;
    type: "add" | "subtract";
  }>({
    open: false,
    stock: null,
    type: "add",
  });

  const { data: stockData, isLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_stock")
        .select(`
          *,
          products(name, sku),
          stock_locations(name)
        `)
        .order("last_movement_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!stockData || stockData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage inventory levels across locations
          </p>
        </div>
        <Card className="p-8 text-center rounded-2xl">
          <p className="text-muted-foreground">
            No stock records found. Add products and locations first.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage inventory levels across locations
        </p>
      </div>

      <Card className="rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockData.map((stock) => {
              const available = stock.quantity - stock.reserved;
              return (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">
                    {stock.products?.name || "—"}
                  </TableCell>
                  <TableCell>{stock.products?.sku || "—"}</TableCell>
                  <TableCell>{stock.stock_locations?.name || "—"}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>{stock.reserved}</TableCell>
                  <TableCell>
                    <span
                      className={
                        available <= 5
                          ? "text-warning font-semibold"
                          : ""
                      }
                    >
                      {available}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAdjustDialog({
                            open: true,
                            stock,
                            type: "add",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAdjustDialog({
                            open: true,
                            stock,
                            type: "subtract",
                          })
                        }
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Adjust
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <StockAdjustDialog
        open={adjustDialog.open}
        onOpenChange={(open) =>
          setAdjustDialog({ ...adjustDialog, open })
        }
        stock={adjustDialog.stock}
        type={adjustDialog.type}
      />
    </div>
  );
}
