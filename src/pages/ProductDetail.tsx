import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  image_urls: string[];
  category: string | null;
  specifications: any;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) loadProduct(id);
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setProduct(data as Product);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Product not found");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img
                      src={product.image_urls[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Thumbnails */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-bold">{product.name}</h1>
                {product.category && (
                  <Badge variant="secondary" className="text-sm">
                    {product.category}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-primary mb-4">
                ${product.price.toFixed(2)}
              </p>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                <Card>
                  <CardContent className="p-4">
                    <dl className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b last:border-0">
                          <dt className="font-medium text-muted-foreground">{key}</dt>
                          <dd className="font-medium">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={addToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  addToCart();
                  navigate("/cart");
                }}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
