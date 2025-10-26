import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ProductDialog from "./ProductDialog";

type Product = Tables<"products"> & {
  categories: { name: string } | null;
};

type ProductsTableProps = {
  products: Product[];
  isLoading: boolean;
};

export default function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center rounded-2xl">
        <p className="text-muted-foreground">No products found</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>MRP</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Tax %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.categories?.name || "—"}</TableCell>
                <TableCell>{formatCurrency(Number(product.mrp))}</TableCell>
                <TableCell>{formatCurrency(Number(product.cost_price))}</TableCell>
                <TableCell>{product.tax_percent}%</TableCell>
                <TableCell>
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditProduct(product);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editProduct}
      />
    </>
  );
}
