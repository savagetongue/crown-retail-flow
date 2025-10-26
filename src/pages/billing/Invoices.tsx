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
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function Invoices() {
  const navigate = useNavigate();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, stock_locations(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all sales invoices
        </p>
      </div>

      {!invoices || invoices.length === 0 ? (
        <Card className="p-8 text-center rounded-2xl">
          <p className="text-muted-foreground">
            No invoices yet. Create your first one!
          </p>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                >
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    {invoice.created_at
                      ? format(new Date(invoice.created_at), "MMM dd, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>{invoice.customer_name || "Walk-in"}</TableCell>
                  <TableCell>{invoice.stock_locations?.name || "—"}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(invoice.total))}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                      {invoice.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
