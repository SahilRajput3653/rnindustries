import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, DollarSign, AlertTriangle, TrendingUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingQuotes: 0,
    pendingMessages: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    totalProfit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoadStats();
  }, []);

  const checkAdminAndLoadStats = async () => {
    try {
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

      await loadStats();
    } catch (error) {
      console.error("Error:", error);
      navigate("/auth");
    }
  };

  const loadStats = async () => {
    try {
      const [productsRes, quotesRes, messagesRes, ordersRes] = await Promise.all([
        supabase.from("products").select("id, stock"),
        supabase.from("quotes").select("id, status"),
        supabase.from("messages").select("id, status"),
        supabase.from("orders").select("id, status, total_amount")
      ]);

      const totalProducts = productsRes.data?.length || 0;
      const lowStockItems = productsRes.data?.filter(p => p.stock < 10).length || 0;
      const pendingQuotes = quotesRes.data?.filter(q => q.status === "pending").length || 0;
      const pendingMessages = messagesRes.data?.filter(m => m.status === "pending").length || 0;
      
      const orders = ordersRes.data || [];
      const completedOrders = orders.filter(o => o.status === "completed");
      const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const totalProfit = totalRevenue * 0.3;

      setStats({ totalProducts, pendingQuotes, pendingMessages, totalRevenue, lowStockItems, totalProfit });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin Panel">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/products")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/quotes")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
              <FileText className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingQuotes}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/messages")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingMessages}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/products")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.lowStockItems}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-600/20">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">${stats.totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
