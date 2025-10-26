import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, Package, AlertTriangle } from "lucide-react";

export default function Reports() {
  const { data: salesData } = useQuery({
    queryKey: ["sales-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_summary")
        .select("*")
        .order("total_revenue", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: deadStock } = useQuery({
    queryKey: ["dead-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dead_stock")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: availability } = useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_availability")
        .select("*")
        .order("available", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Sales analytics and inventory insights
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!salesData || salesData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No sales data available
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>First Sale</TableHead>
                    <TableHead>Last Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">
                        {item.product_name}
                      </TableCell>
                      <TableCell>{formatNumber(Number(item.total_qty_sold))}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(Number(item.total_revenue))}
                      </TableCell>
                      <TableCell>
                        {item.first_sale
                          ? new Date(item.first_sale).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {item.last_sale
                          ? new Date(item.last_sale).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Dead Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!deadStock || deadStock.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No dead stock items
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>On Hand</TableHead>
                    <TableHead>Last Movement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deadStock.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.on_hand}</TableCell>
                      <TableCell>
                        {item.last_movement
                          ? new Date(item.last_movement).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!availability || availability.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No availability data
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>On Hand</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availability.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.total_on_hand}</TableCell>
                      <TableCell>{item.total_reserved}</TableCell>
                      <TableCell>
                        <span
                          className={
                            Number(item.available) <= 5
                              ? "text-warning font-semibold"
                              : ""
                          }
                        >
                          {item.available}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
