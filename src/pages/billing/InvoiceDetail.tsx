import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Printer, Download } from "lucide-react";
import { InvoicePDF } from "@/components/billing/InvoicePDF";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          stock_locations(name),
          invoice_items(*, products(name, sku))
        `)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdfElement = document.getElementById("invoice-pdf");
      if (!pdfElement) return;

      // Temporarily show the PDF element
      pdfElement.style.display = "block";

      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`);

      // Hide the PDF element again
      pdfElement.style.display = "none";
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Invoice {invoice.invoice_number}
          </h1>
          <p className="text-muted-foreground mt-1">
            {invoice.created_at
              ? format(new Date(invoice.created_at), "MMMM dd, yyyy")
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <Card className="p-8 rounded-2xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">CROWN</h2>
            <p className="text-sm text-muted-foreground">Perfect Menswear</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Invoice Number</div>
            <div className="font-semibold">{invoice.invoice_number}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <div className="text-sm space-y-1">
              <div>{invoice.customer_name || "Walk-in Customer"}</div>
              {invoice.customer_phone && <div>{invoice.customer_phone}</div>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Invoice Details</h3>
            <div className="text-sm space-y-1">
              <div>
                Location: {invoice.stock_locations?.name || "—"}
              </div>
              <div>
                Date:{" "}
                {invoice.created_at
                  ? format(new Date(invoice.created_at), "MMM dd, yyyy")
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.invoice_items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.products?.name || "—"}</TableCell>
                  <TableCell>{item.products?.sku || "—"}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{formatCurrency(Number(item.unit_price))}</TableCell>
                  <TableCell>
                    {formatCurrency(Number(item.discount_amount) || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(item.line_total))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span>{formatCurrency(Number(invoice.discount_amount) || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(Number(invoice.tax_amount) || 0)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-accent">
                {formatCurrency(Number(invoice.total))}
              </span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}
      </Card>

      {/* Hidden PDF Template for Download */}
      <div style={{ display: "none" }}>
        <InvoicePDF invoice={invoice} />
      </div>
    </div>
  );
}
