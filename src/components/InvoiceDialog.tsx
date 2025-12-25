import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name?: string;
  product_description?: string;
};

type Order = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  notes?: string;
};

type InvoiceDialogProps = {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InvoiceDialog({ order, open, onOpenChange }: InvoiceDialogProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    if (order && open) {
      loadOrderDetails();
      loadCompanyInfo();
    }
  }, [order, open]);

  const loadOrderDetails = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const { data: items, error } = await supabase
        .from("order_items")
        .select(`
          *,
          products (
            name,
            description
          )
        `)
        .eq("order_id", order.id);

      if (error) throw error;

      const itemsWithProducts = items?.map((item: any) => ({
        ...item,
        product_name: item.products?.name || "Product",
        product_description: item.products?.description || "",
      })) || [];

      setOrderItems(itemsWithProducts);
    } catch (error) {
      console.error("Error loading order items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("company_info")
        .select("*")
        .single();

      if (error) throw error;
      setCompanyInfo(data);
    } catch (error) {
      console.error("Error loading company info:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version
    const printContents = document.getElementById("invoice-content")?.innerHTML;
    const originalContents = document.body.innerHTML;
    
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice #{order.id.slice(0, 8).toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6 p-6 bg-background print:p-8">
          {/* Company Header */}
          <div className="flex justify-between items-start">
            <div>
              {companyInfo?.logo_url && (
                <img src={companyInfo.logo_url} alt="Company Logo" className="h-16 mb-4" />
              )}
              <h1 className="text-3xl font-bold text-primary">
                {companyInfo?.company_name || "RN INDUSTRIES"}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {companyInfo?.address}
              </p>
              <p className="text-sm text-muted-foreground">
                Email: {companyInfo?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Phone: {companyInfo?.phone}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Invoice #: {order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-semibold capitalize">{order.status}</span>
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO:</h3>
              <p className="font-semibold">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">SHIP TO:</h3>
              <p className="text-sm">{order.shipping_address}</p>
            </div>
          </div>

          <Separator />

          {/* Order Items Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Item</th>
                    <th className="text-left p-3 font-semibold">Description</th>
                    <th className="text-right p-3 font-semibold">Qty</th>
                    <th className="text-right p-3 font-semibold">Unit Price</th>
                    <th className="text-right p-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-6 text-muted-foreground">
                        Loading order items...
                      </td>
                    </tr>
                  ) : orderItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-6 text-muted-foreground">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    orderItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">
                          <p className="font-medium">{item.product_name}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.product_description}
                          </p>
                        </td>
                        <td className="text-right p-3">{item.quantity}</td>
                        <td className="text-right p-3">${item.unit_price.toFixed(2)}</td>
                        <td className="text-right p-3 font-medium">
                          ${item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <Separator />
              <div className="flex justify-between items-center py-3">
                <span className="text-xl font-bold">TOTAL</span>
                <span className="text-2xl font-bold text-primary">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">NOTES:</h3>
                <p className="text-sm">{order.notes}</p>
              </div>
            </>
          )}

          {/* Footer */}
          <Separator />
          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            {companyInfo?.description && (
              <p className="mt-2">{companyInfo.description}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
