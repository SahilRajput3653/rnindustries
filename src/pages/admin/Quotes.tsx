import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type QuoteStatus = "pending" | "approved" | "rejected";

type Quote = {
  id: string;
  customer_name: string;
  customer_email: string;
  status: QuoteStatus;
  created_at: string;
};

const AdminQuotes = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoadQuotes();
  }, []);

  const checkAdminAndLoadQuotes = async () => {
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

      await loadQuotes();
    } catch (error) {
      console.error("Error:", error);
      navigate("/auth");
    }
  };

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes((data as Quote[]) || []);
    } catch (error) {
      console.error("Error loading quotes:", error);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (id: string, status: QuoteStatus) => {
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(`Quote ${status}`);
      await loadQuotes();
    } catch (error) {
      console.error("Error updating quote:", error);
      toast.error("Failed to update quote");
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quote Management</h1>
        <Button onClick={() => navigate("/admin")}>Back to Dashboard</Button>
      </div>

      <div className="grid gap-4">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No quotes found</p>
            </CardContent>
          </Card>
        ) : (
          quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{quote.customer_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{quote.customer_email}</p>
                  </div>
                  <Badge variant={
                    quote.status === "approved" ? "default" :
                    quote.status === "rejected" ? "destructive" :
                    "secondary"
                  }>
                    {quote.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateQuoteStatus(quote.id, "approved")}
                    disabled={quote.status === "approved"}
                    size="sm"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateQuoteStatus(quote.id, "rejected")}
                    disabled={quote.status === "rejected"}
                    variant="destructive"
                    size="sm"
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQuotes;
