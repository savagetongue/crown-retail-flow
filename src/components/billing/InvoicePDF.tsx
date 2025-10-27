import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

type InvoicePDFProps = {
  invoice: any;
};

export const InvoicePDF = ({ invoice }: InvoicePDFProps) => {
  return (
    <div id="invoice-pdf" className="bg-white text-black p-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-12 border-b-2 border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">CROWN</h1>
          <p className="text-lg text-gray-600 mt-1">The Premium Mens Wear</p>
          <p className="text-sm text-gray-500 mt-2">
            Shreepur-Khandali Road<br />
            Pin - 413112, Tal-Malshiras<br />
            Dist-Solapur, Maharashtra
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 uppercase">Invoice</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {invoice.invoice_number}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {invoice.created_at
              ? format(new Date(invoice.created_at), "MMMM dd, yyyy")
              : ""}
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
          Bill To
        </h2>
        <div className="text-gray-900">
          <div className="font-semibold text-lg">
            {invoice.customer_name || "Walk-in Customer"}
          </div>
          {invoice.customer_phone && (
            <div className="text-sm text-gray-600">{invoice.customer_phone}</div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-3 text-sm font-semibold text-gray-700 uppercase">
              Item
            </th>
            <th className="text-left py-3 text-sm font-semibold text-gray-700 uppercase">
              SKU
            </th>
            <th className="text-center py-3 text-sm font-semibold text-gray-700 uppercase">
              Qty
            </th>
            <th className="text-right py-3 text-sm font-semibold text-gray-700 uppercase">
              Price
            </th>
            <th className="text-right py-3 text-sm font-semibold text-gray-700 uppercase">
              Discount
            </th>
            <th className="text-right py-3 text-sm font-semibold text-gray-700 uppercase">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoice_items?.map((item: any, index: number) => (
            <tr
              key={item.id}
              className={index !== invoice.invoice_items.length - 1 ? "border-b border-gray-200" : ""}
            >
              <td className="py-3 text-gray-900">{item.products?.name || "—"}</td>
              <td className="py-3 text-gray-600 text-sm">{item.products?.sku || "—"}</td>
              <td className="py-3 text-center text-gray-900">{item.qty}</td>
              <td className="py-3 text-right text-gray-900">
                {formatCurrency(Number(item.unit_price))}
              </td>
              <td className="py-3 text-right text-gray-600">
                -{formatCurrency(Number(item.discount_amount) || 0)}
              </td>
              <td className="py-3 text-right font-semibold text-gray-900">
                {formatCurrency(Number(item.line_total))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 text-gray-700">
            <span>Subtotal</span>
            <span>{formatCurrency(Number(invoice.subtotal))}</span>
          </div>
          {Number(invoice.discount_amount) > 0 && (
            <div className="flex justify-between py-2 text-gray-700">
              <span>Discount</span>
              <span className="text-red-600">
                -{formatCurrency(Number(invoice.discount_amount))}
              </span>
            </div>
          )}
          {Number(invoice.tax_amount) > 0 && (
            <div className="flex justify-between py-2 text-gray-700">
              <span>Tax</span>
              <span>{formatCurrency(Number(invoice.tax_amount))}</span>
            </div>
          )}
          <div className="flex justify-between py-4 border-t-2 border-gray-800 text-xl font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(Number(invoice.total))}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
            Notes
          </h3>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-300 pt-6 mt-12 text-center">
        <p className="text-sm text-gray-600">
          Thank you for your business!
        </p>
        <p className="text-xs text-gray-500 mt-2">
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
};
