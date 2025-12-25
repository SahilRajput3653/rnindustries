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
import { Building2, Users, Shield, Save, Trash2, UserPlus, Palette, Globe, Share2, ImageIcon } from "lucide-react";
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

type SiteSettings = {
  theme_colors: {
    primary: string;
    accent: string;
    destructive: string;
  };
  hero_content: {
    title: string;
    subtitle: string;
    cta_text: string;
  };
  seo_settings: {
    site_title: string;
    meta_description: string;
    meta_keywords: string;
  };
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  site_images: {
    logo_url: string;
    hero_image: string;
    favicon: string;
  };
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    theme_colors: { primary: "215 75% 45%", accent: "30 90% 55%", destructive: "0 84% 60%" },
    hero_content: { title: "", subtitle: "", cta_text: "" },
    seo_settings: { site_title: "", meta_description: "", meta_keywords: "" },
    social_media: { facebook: "", twitter: "", instagram: "", linkedin: "" },
    site_images: { logo_url: "", hero_image: "", favicon: "" },
  });

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

      await Promise.all([loadCompanyInfo(), loadAdmins(), loadSiteSettings()]);
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

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");

      if (error) throw error;
      
      if (data) {
        const settings: any = {};
        data.forEach((item) => {
          settings[item.setting_key] = item.setting_value;
        });
        setSiteSettings(settings as SiteSettings);
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
      toast.error("Failed to load site settings");
    }
  };

  const saveSiteSettings = async (key: keyof SiteSettings, value: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Settings updated successfully");
      setSiteSettings({ ...siteSettings, [key]: value });
    } catch (error) {
      console.error("Error saving site settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="company" className="flex items-center gap-2 py-3">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2 py-3">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Design</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2 py-3">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2 py-3">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2 py-3">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Images</span>
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2 py-3">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Admins</span>
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

        {/* Design & Theme Tab */}
        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>
                Customize your site's color scheme (HSL format: hue saturation% lightness%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    value={siteSettings.theme_colors.primary}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      theme_colors: { ...siteSettings.theme_colors, primary: e.target.value }
                    })}
                    placeholder="215 75% 45%"
                  />
                  <div 
                    className="w-20 h-10 rounded border"
                    style={{ backgroundColor: `hsl(${siteSettings.theme_colors.primary})` }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accent_color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent_color"
                    value={siteSettings.theme_colors.accent}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      theme_colors: { ...siteSettings.theme_colors, accent: e.target.value }
                    })}
                    placeholder="30 90% 55%"
                  />
                  <div 
                    className="w-20 h-10 rounded border"
                    style={{ backgroundColor: `hsl(${siteSettings.theme_colors.accent})` }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="destructive_color">Destructive/Error Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="destructive_color"
                    value={siteSettings.theme_colors.destructive}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      theme_colors: { ...siteSettings.theme_colors, destructive: e.target.value }
                    })}
                    placeholder="0 84% 60%"
                  />
                  <div 
                    className="w-20 h-10 rounded border"
                    style={{ backgroundColor: `hsl(${siteSettings.theme_colors.destructive})` }}
                  />
                </div>
              </div>

              <Button 
                onClick={() => saveSiteSettings('theme_colors', siteSettings.theme_colors)} 
                disabled={saving}
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Theme"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Content Tab */}
        <TabsContent value="content">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Customize the main hero section on your homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    value={siteSettings.hero_content.title}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      hero_content: { ...siteSettings.hero_content, title: e.target.value }
                    })}
                    placeholder="Welcome to RN Industries"
                  />
                </div>

                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    rows={3}
                    value={siteSettings.hero_content.subtitle}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      hero_content: { ...siteSettings.hero_content, subtitle: e.target.value }
                    })}
                    placeholder="Quality products for your business"
                  />
                </div>

                <div>
                  <Label htmlFor="hero_cta">Call-to-Action Button Text</Label>
                  <Input
                    id="hero_cta"
                    value={siteSettings.hero_content.cta_text}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      hero_content: { ...siteSettings.hero_content, cta_text: e.target.value }
                    })}
                    placeholder="Shop Now"
                  />
                </div>

                <Button 
                  onClick={() => saveSiteSettings('hero_content', siteSettings.hero_content)} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Hero Content"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your site for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={siteSettings.seo_settings.site_title}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      seo_settings: { ...siteSettings.seo_settings, site_title: e.target.value }
                    })}
                    placeholder="RN Industries"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    rows={3}
                    value={siteSettings.seo_settings.meta_description}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      seo_settings: { ...siteSettings.seo_settings, meta_description: e.target.value }
                    })}
                    placeholder="Your trusted partner for industrial products"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {siteSettings.seo_settings.meta_description.length}/160 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_keywords">Meta Keywords (comma-separated)</Label>
                  <Input
                    id="meta_keywords"
                    value={siteSettings.seo_settings.meta_keywords}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      seo_settings: { ...siteSettings.seo_settings, meta_keywords: e.target.value }
                    })}
                    placeholder="industrial, products, manufacturing"
                  />
                </div>

                <Button 
                  onClick={() => saveSiteSettings('seo_settings', siteSettings.seo_settings)} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save SEO Settings"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Add your social media profile URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={siteSettings.social_media.facebook}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    social_media: { ...siteSettings.social_media, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <Label htmlFor="twitter">Twitter/X URL</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={siteSettings.social_media.twitter}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    social_media: { ...siteSettings.social_media, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={siteSettings.social_media.instagram}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    social_media: { ...siteSettings.social_media, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={siteSettings.social_media.linkedin}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    social_media: { ...siteSettings.social_media, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>

              <Button 
                onClick={() => saveSiteSettings('social_media', siteSettings.social_media)} 
                disabled={saving}
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Social Links"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Site Images</CardTitle>
              <CardDescription>
                Upload and manage your site's visual assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={siteSettings.site_images.logo_url}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    site_images: { ...siteSettings.site_images, logo_url: e.target.value }
                  })}
                  placeholder="https://example.com/logo.png"
                />
                {siteSettings.site_images.logo_url && (
                  <div className="mt-2">
                    <img 
                      src={siteSettings.site_images.logo_url} 
                      alt="Logo preview" 
                      className="h-16 object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="hero_image">Hero Image URL</Label>
                <Input
                  id="hero_image"
                  type="url"
                  value={siteSettings.site_images.hero_image}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    site_images: { ...siteSettings.site_images, hero_image: e.target.value }
                  })}
                  placeholder="https://example.com/hero.jpg"
                />
                {siteSettings.site_images.hero_image && (
                  <div className="mt-2">
                    <img 
                      src={siteSettings.site_images.hero_image} 
                      alt="Hero preview" 
                      className="h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  type="url"
                  value={siteSettings.site_images.favicon}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    site_images: { ...siteSettings.site_images, favicon: e.target.value }
                  })}
                  placeholder="https://example.com/favicon.ico"
                />
                {siteSettings.site_images.favicon && (
                  <div className="mt-2">
                    <img 
                      src={siteSettings.site_images.favicon} 
                      alt="Favicon preview" 
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={() => saveSiteSettings('site_images', siteSettings.site_images)} 
                disabled={saving}
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Images"}
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
