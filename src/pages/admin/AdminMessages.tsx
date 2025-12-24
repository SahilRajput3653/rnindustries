import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, User, Calendar, Send, CheckCircle, XCircle, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MessageStatus = "pending" | "replied" | "closed";

type Message = {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  admin_reply: string | null;
  status: MessageStatus;
  created_at: string;
  replied_at: string | null;
};

const AdminMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    checkAdminAndLoadMessages();
  }, []);

  const checkAdminAndLoadMessages = async () => {
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

      await loadMessages();
    } catch (error) {
      console.error("Error:", error);
      navigate("/auth");
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: MessageStatus) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(`Message ${status}`);
      await loadMessages();
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSendingReply(true);

    try {
      const { error } = await supabase
        .from("messages")
        .update({
          admin_reply: replyText,
          status: "replied",
          replied_at: new Date().toISOString(),
        })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      toast.success("Reply sent successfully");
      setReplyText("");
      setSelectedMessage(null);
      await loadMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusVariant = (status: MessageStatus): "default" | "secondary" | "destructive" => {
    if (status === "replied") return "default";
    if (status === "closed") return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <AdminLayout title="Messages">
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
    <AdminLayout title="Messages">
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {messages.filter(m => m.status === "pending").length}
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
                  <p className="text-sm text-muted-foreground">Replied</p>
                  <p className="text-2xl font-bold">
                    {messages.filter(m => m.status === "replied").length}
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
                  <p className="text-sm text-muted-foreground">Closed</p>
                  <p className="text-2xl font-bold">
                    {messages.filter(m => m.status === "closed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="grid gap-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-muted-foreground">
                    Customer messages will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-xl">{message.customer_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Mail className="h-4 w-4" />
                        <a 
                          href={`mailto:${message.customer_email}`}
                          className="hover:text-primary hover:underline"
                        >
                          {message.customer_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(message.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="font-semibold text-sm mb-1">Subject: {message.subject}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(message.status)}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>

                  {message.admin_reply && (
                    <div className="mb-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-semibold mb-2">Your Reply:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {message.admin_reply}
                      </p>
                      {message.replied_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Replied on {new Date(message.replied_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedMessage(message);
                            setReplyText(message.admin_reply || "");
                          }}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {message.admin_reply ? "Update Reply" : "Send Reply"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reply to {message.customer_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold mb-2">Customer Message:</p>
                            <p className="text-sm text-muted-foreground">{message.message}</p>
                          </div>
                          <div>
                            <Textarea
                              placeholder="Type your reply here..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={6}
                            />
                          </div>
                          <Button
                            onClick={sendReply}
                            disabled={sendingReply || !replyText.trim()}
                            className="w-full"
                          >
                            {sendingReply ? "Sending..." : "Send Reply"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {message.status === "pending" && (
                      <Button
                        onClick={() => updateMessageStatus(message.id, "closed")}
                        variant="outline"
                        size="sm"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Close
                      </Button>
                    )}
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

export default AdminMessages;
