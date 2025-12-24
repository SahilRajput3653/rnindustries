import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    profit: 0
  });

  useEffect(() => {
    checkAdminAndLoadAnalytics();
  }, []);

  const checkAdminAndLoadAnalytics = async () => {
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

    await loadAnalytics();
  };

  const loadAnalytics = async () => {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("status, total_amount");

      if (error) throw error;

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const completedOrders = orders?.filter(o => o.status === "completed").length || 0;
      const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
      const averageOrderValue = orders?.length ? totalRevenue / orders.length : 0;
      const profit = totalRevenue * 0.3; // Example: 30% profit margin

      setAnalytics({ totalRevenue, completedOrders, pendingOrders, averageOrderValue, profit });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load analytics");
    }
  };

  return (
    <AdminLayout title="Analytics & Reports">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completedOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${analytics.profit.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
    </AdminLayout>
  );
}
