import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";


const quoteSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

const messageSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  subject: z.string()
    .trim()
    .min(3, { message: "Subject must be at least 3 characters" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

type CompanyInfo = {
  company_name: string;
  phone: string;
  email: string;
  address: string;
  description: string | null;
};

export default function Contact() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [messageFormData, setMessageFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});
  const [messageErrors, setMessageErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    const { data } = await supabase
      .from("company_info")
      .select("*")
      .single();
    
    if (data) setInfo(data as CompanyInfo);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteErrors({});

    // Validate form data
    const result = quoteSchema.safeParse(quoteFormData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setQuoteErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setQuoteLoading(true);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Insert quote request
      const { error } = await supabase
        .from("quotes")
        .insert({
          customer_name: result.data.name,
          customer_email: result.data.email,
          phone: result.data.phone,
          message: result.data.message,
          user_id: user?.id || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Quote request submitted successfully! We'll get back to you soon.");
      
      // Reset form
      setQuoteFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast.error("Failed to submit quote request. Please try again.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageErrors({});

    // Validate form data
    const result = messageSchema.safeParse(messageFormData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setMessageErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setMessageLoading(true);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Insert message
      const { error } = await supabase
        .from("messages")
        .insert({
          customer_name: result.data.name,
          customer_email: result.data.email,
          subject: result.data.subject,
          message: result.data.message,
          user_id: user?.id || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Message sent successfully! We'll respond to you soon.");
      
      // Reset form
      setMessageFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground">
              {info?.description || "Get in touch with us for inquiries"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Phone / WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a 
                  href={`tel:${info?.phone}`} 
                  className="block text-primary hover:underline"
                >
                  {info?.phone || "+91 9599184546"}
                </a>
                <a
                  href={`https://wa.me/${(info?.phone || "+919599184546").replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#20BA5A] transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`mailto:${info?.email}`} className="text-primary hover:underline">
                  {info?.email || "contact@rnindustries.com"}
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {info?.address || "123 Industrial Ave, City, State"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visit Our Factory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {info?.address || "123 Industrial Ave, Manufacturing District, City, State 12345"}
              </p>
              <div className="aspect-video rounded-lg overflow-hidden border">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(info?.address || "H-3/318, Kunwar Singh Nagar, Gali No. 6, Nangloi, Delhi-41")}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Factory Location"
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info?.address || "H-3/318, Kunwar Singh Nagar, Gali No. 6, Nangloi, Delhi-41")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </CardContent>
          </Card>

          {/* Request Quote Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request a Quote</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill out the form below and we'll get back to you with a detailed quote
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={quoteFormData.name}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, name: e.target.value })}
                      className={quoteErrors.name ? "border-destructive" : ""}
                    />
                    {quoteErrors.name && (
                      <p className="text-sm text-destructive mt-1">{quoteErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={quoteFormData.email}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                      className={quoteErrors.email ? "border-destructive" : ""}
                    />
                    {quoteErrors.email && (
                      <p className="text-sm text-destructive mt-1">{quoteErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={quoteFormData.phone}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                    className={quoteErrors.phone ? "border-destructive" : ""}
                  />
                  {quoteErrors.phone && (
                    <p className="text-sm text-destructive mt-1">{quoteErrors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Requirements *</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your requirements, including product specifications, quantity, and any special needs..."
                    rows={6}
                    value={quoteFormData.message}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, message: e.target.value })}
                    className={quoteErrors.message ? "border-destructive" : ""}
                  />
                  {quoteErrors.message && (
                    <p className="text-sm text-destructive mt-1">{quoteErrors.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={quoteLoading}
                >
                  {quoteLoading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Quote Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Message Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <p className="text-sm text-muted-foreground">
                Have a question or inquiry? Send us a message and we'll respond promptly
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="msg-name">Name *</Label>
                    <Input
                      id="msg-name"
                      type="text"
                      placeholder="Your full name"
                      value={messageFormData.name}
                      onChange={(e) => setMessageFormData({ ...messageFormData, name: e.target.value })}
                      className={messageErrors.name ? "border-destructive" : ""}
                    />
                    {messageErrors.name && (
                      <p className="text-sm text-destructive mt-1">{messageErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="msg-email">Email *</Label>
                    <Input
                      id="msg-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={messageFormData.email}
                      onChange={(e) => setMessageFormData({ ...messageFormData, email: e.target.value })}
                      className={messageErrors.email ? "border-destructive" : ""}
                    />
                    {messageErrors.email && (
                      <p className="text-sm text-destructive mt-1">{messageErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="msg-subject">Subject *</Label>
                  <Input
                    id="msg-subject"
                    type="text"
                    placeholder="What is your message about?"
                    value={messageFormData.subject}
                    onChange={(e) => setMessageFormData({ ...messageFormData, subject: e.target.value })}
                    className={messageErrors.subject ? "border-destructive" : ""}
                  />
                  {messageErrors.subject && (
                    <p className="text-sm text-destructive mt-1">{messageErrors.subject}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="msg-message">Message *</Label>
                  <Textarea
                    id="msg-message"
                    placeholder="Type your message here..."
                    rows={6}
                    value={messageFormData.message}
                    onChange={(e) => setMessageFormData({ ...messageFormData, message: e.target.value })}
                    className={messageErrors.message ? "border-destructive" : ""}
                  />
                  {messageErrors.message && (
                    <p className="text-sm text-destructive mt-1">{messageErrors.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={messageLoading}
                >
                  {messageLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
