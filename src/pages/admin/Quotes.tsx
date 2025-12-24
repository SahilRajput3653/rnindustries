import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, User, Calendar, CheckCircle, XCircle } from "lucide-react";
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

  const getStatusVariant = (status: QuoteStatus): "default" | "secondary" | "destructive" => {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <AdminLayout title="Quote Management">
        <div className="space-y-6">
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quote Management">
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {quotes.filter(q => q.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">
                    {quotes.filter(q => q.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">
                    {quotes.filter(q => q.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quotes List */}
        <div className="grid gap-4">
          {quotes.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No quotes yet</h3>
                  <p className="text-muted-foreground">
                    Customer quote requests will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-xl">{quote.customer_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Mail className="h-4 w-4" />
                        <a 
                          href={`mailto:${quote.customer_email}`}
                          className="hover:text-primary hover:underline"
                        >
                          {quote.customer_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(quote.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateQuoteStatus(quote.id, "approved")}
                      disabled={quote.status === "approved"}
                      size="sm"
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateQuoteStatus(quote.id, "rejected")}
                      disabled={quote.status === "rejected"}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQuotes;
