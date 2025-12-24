import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Shield, Save, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const companySchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Phone must be at least 10 digits").max(20),
  address: z.string().trim().min(5, "Address is required").max(500),
  description: z.string().trim().max(1000).optional(),
});

type Admin = {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    checkAdminAndLoadSettings();
  }, []);

  const checkAdminAndLoadSettings = async () => {
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

      await Promise.all([loadCompanyInfo(), loadAdmins()]);
    } catch (error) {
      console.error("Error:", error);
      navigate("/auth");
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
      if (data) {
        setCompanyInfo({
          company_name: data.company_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          description: data.description || "",
        });
      }
    } catch (error) {
      console.error("Error loading company info:", error);
      toast.error("Failed to load company information");
    }
  };

  const loadAdmins = async () => {
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          created_at
        `)
        .eq("role", "admin");

      if (error) throw error;

      // Fetch profiles for admin users
      if (roles && roles.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email")
          .in("user_id", roles.map(r => r.user_id));

        const adminsWithEmails = roles.map(role => ({
          ...role,
          email: profiles?.find(p => p.user_id === role.user_id)?.email || "No email",
        }));

        setAdmins(adminsWithEmails);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      toast.error("Failed to load admin users");
    }
  };

  const saveCompanyInfo = async () => {
    setErrors({});

    const result = companySchema.safeParse(companyInfo);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("company_info")
        .update({
          company_name: result.data.company_name,
          email: result.data.email,
          phone: result.data.phone,
          address: result.data.address,
          description: result.data.description || null,
        })
        .eq("id", (await supabase.from("company_info").select("id").single()).data?.id);

      if (error) throw error;

      toast.success("Company information updated successfully");
    } catch (error) {
      console.error("Error saving company info:", error);
      toast.error("Failed to update company information");
    } finally {
      setSaving(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      // Check if user exists with this email
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", newAdminEmail.toLowerCase().trim())
        .single();

      if (!profile) {
        toast.error("No user found with this email address");
        return;
      }

      // Check if already an admin
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", profile.user_id)
        .eq("role", "admin")
        .single();

      if (existing) {
        toast.error("This user is already an admin");
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: profile.user_id,
          role: "admin",
        });

      if (error) throw error;

      toast.success("Admin added successfully");
      setNewAdminEmail("");
      await loadAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin");
    }
  };

  const removeAdmin = async (roleId: string, email: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success(`Removed admin access for ${email}`);
      await loadAdmins();
    } catch (error) {
      console.error("Error removing admin:", error);
      toast.error("Failed to remove admin");
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="company" className="flex items-center gap-2 py-3">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company Info</span>
            <span className="sm:hidden">Company</span>
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2 py-3">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Users</span>
            <span className="sm:hidden">Admins</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details that appear across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={companyInfo.company_name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_name: e.target.value })}
                  className={errors.company_name ? "border-destructive" : ""}
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive mt-1">{errors.company_name}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  rows={3}
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="A brief description of your company..."
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              <Button onClick={saveCompanyInfo} disabled={saving} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Users Tab */}
        <TabsContent value="admins">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Admin</CardTitle>
                <CardDescription>
                  Grant admin access to an existing user by their email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addAdmin()}
                    className="flex-1"
                  />
                  <Button onClick={addAdmin} className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Admins</CardTitle>
                <CardDescription>
                  Manage users with administrative access ({admins.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {admins.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No admin users found
                    </p>
                  ) : (
                    admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{admin.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Added {new Date(admin.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end sm:justify-start">
                          <Badge>Admin</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove admin access for {admin.email}? 
                                  They will no longer be able to access the admin panel.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeAdmin(admin.id, admin.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
