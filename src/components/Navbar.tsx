import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShoppingCart, Menu, X, User, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
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
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full bg-background">
                  {/* Close button */}
                  <div className="flex justify-end p-4 border-b">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col p-6 space-y-1">
                    <Link 
                      to="/" 
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-2"
                    >
                      Home
                    </Link>
                    <Link 
                      to="/products" 
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-2"
                    >
                      Products
                    </Link>
                    <Link 
                      to="/about" 
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-2"
                    >
                      About
                    </Link>
                    <Link 
                      to="/contact" 
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-2"
                    >
                      Contact
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t mx-6" />

                  {/* User Section */}
                  <div className="flex flex-col p-6 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/cart");
                        setMobileOpen(false);
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                    </Button>

                    {user ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/orders");
                            setMobileOpen(false);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          My Orders
                        </Button>
                        
                        {isAdmin && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              navigate("/admin");
                              setMobileOpen(false);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={() => {
                            handleSignOut();
                            setMobileOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
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
