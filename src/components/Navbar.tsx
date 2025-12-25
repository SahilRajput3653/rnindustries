import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShoppingCart, Menu, X, User, LogOut, Shield, Mail, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
        setUserEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    setIsAdmin(data?.some(r => r.role === "admin") || false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="text-foreground hover:text-primary transition-colors">
        Home
      </Link>
      <Link to="/products" className="text-foreground hover:text-primary transition-colors">
        Products
      </Link>
      <Link to="/about" className="text-foreground hover:text-primary transition-colors">
        About
      </Link>
      <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
        Contact
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RN INDUSTRIES
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-quotes")}>
                    My Quotes
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full bg-background">
                  {/* User Profile Section */}
                  {user ? (
                    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {userEmail?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {userEmail?.split("@")[0] || "User"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {userEmail}
                          </p>
                          {isAdmin && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border-b bg-gradient-to-br from-muted/50 to-background">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Welcome!</p>
                          <p className="text-sm text-muted-foreground">Sign in to continue</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col p-4 space-y-1">
                      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Navigation
                      </p>
                      <Link 
                        to="/" 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg py-3 px-3"
                      >
                        Home
                      </Link>
                      <Link 
                        to="/products" 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg py-3 px-3"
                      >
                        Products
                      </Link>
                      <Link 
                        to="/about" 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg py-3 px-3"
                      >
                        About
                      </Link>
                      <Link 
                        to="/contact" 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg py-3 px-3"
                      >
                        Contact
                      </Link>
                    </div>

                    {/* User Actions Section */}
                    <div className="border-t">
                      <div className="flex flex-col p-4 space-y-2">
                        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Actions
                        </p>
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-primary/5 hover:text-primary"
                          onClick={() => {
                            navigate("/cart");
                            setMobileOpen(false);
                          }}
                        >
                          <ShoppingCart className="mr-3 h-4 w-4" />
                          Shopping Cart
                        </Button>

                        {user ? (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start hover:bg-primary/5 hover:text-primary"
                              onClick={() => {
                                navigate("/orders");
                                setMobileOpen(false);
                              }}
                            >
                              <User className="mr-3 h-4 w-4" />
                              My Orders
                            </Button>

                            <Button
                              variant="ghost"
                              className="w-full justify-start hover:bg-primary/5 hover:text-primary"
                              onClick={() => {
                                navigate("/my-quotes");
                                setMobileOpen(false);
                              }}
                            >
                              <FileText className="mr-3 h-4 w-4" />
                              My Quotes
                            </Button>
                            
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                className="w-full justify-start hover:bg-primary/5 hover:text-primary"
                                onClick={() => {
                                  navigate("/admin");
                                  setMobileOpen(false);
                                }}
                              >
                                <Shield className="mr-3 h-4 w-4" />
                                Admin Dashboard
                              </Button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="border-t p-4 bg-muted/20">
                    {user ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          handleSignOut();
                          setMobileOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          navigate("/auth");
                          setMobileOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
