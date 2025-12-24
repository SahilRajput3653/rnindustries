import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Order = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoadOrders();
  }, []);

  const checkAdminAndLoadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some(r => r.role === "admin")) {
      toast.error("Access denied");
      navigate("/");
      return;
    }

    await loadOrders();
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success("Order updated");
      await loadOrders();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update order");
    }
  };

  return (
    <AdminLayout title="Order Management">
      <div className="space-y-6">
        <p className="text-muted-foreground">{orders.length} total orders</p>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Customer</p>
                  <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Shipping</p>
                  <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                  <p className="text-lg font-bold text-primary mt-2">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
