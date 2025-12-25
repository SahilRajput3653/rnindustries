import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Calendar, CheckCircle, XCircle, Clock, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type QuoteStatus = "pending" | "approved" | "rejected";

type Quote = {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string | null;
  message: string | null;
  status: QuoteStatus;
  created_at: string;
};

export default function MyQuotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadQuotes();
  }, []);

  const checkAuthAndLoadQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      await loadQuotes(user.id);
    } catch (error) {
      console.error("Error:", error);
      navigate("/auth");
    }
  };

  const loadQuotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", userId)
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

  const getStatusVariant = (status: QuoteStatus): "default" | "secondary" | "destructive" => {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  const getStatusIcon = (status: QuoteStatus) => {
    if (status === "approved") return <CheckCircle className="h-5 w-5" />;
    if (status === "rejected") return <XCircle className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  const getStatusMessage = (status: QuoteStatus) => {
    if (status === "approved") {
      return "Your quote has been approved! We will contact you shortly with more details.";
    }
    if (status === "rejected") {
      return "Unfortunately, we cannot fulfill this quote request at this time.";
    }
    return "Your quote is being reviewed. We will update you soon.";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Quote Requests</h1>
            <p className="text-muted-foreground">
              Track the status of your quote requests
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Clock className="h-5 w-5 text-secondary" />
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
          <div className="space-y-4">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : quotes.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No quotes yet</h3>
                    <p className="text-muted-foreground">
                      You haven't submitted any quote requests yet.
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
                        <div className="flex items-center gap-2 mb-3">
                          <CardTitle className="text-xl">Quote Request</CardTitle>
                          <Badge variant={getStatusVariant(quote.status)} className="flex items-center gap-1">
                            {getStatusIcon(quote.status)}
                            <span>{quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Submitted on {new Date(quote.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{quote.customer_email}</span>
                          </div>

                          {quote.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{quote.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Status Message */}
                    <div className={`mb-4 p-4 rounded-lg ${
                      quote.status === "approved" 
                        ? "bg-primary/10 border border-primary/20" 
                        : quote.status === "rejected"
                        ? "bg-destructive/10 border border-destructive/20"
                        : "bg-secondary/10 border border-secondary/20"
                    }`}>
                      <p className="text-sm font-medium">
                        {getStatusMessage(quote.status)}
                      </p>
                    </div>

                    {/* Quote Message */}
                    {quote.message && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm font-semibold">Your Requirements:</p>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                          {quote.message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
