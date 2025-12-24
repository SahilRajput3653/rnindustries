import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Package, Shield, Zap, Phone, Factory, 
  Award, Users, Clock, CheckCircle2, Star, TrendingUp,
  Wrench, Settings, Target
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const stats = [
    { label: "Years Experience", value: "25+", icon: Award },
    { label: "Happy Clients", value: "500+", icon: Users },
    { label: "Projects Delivered", value: "1000+", icon: CheckCircle2 },
    { label: "Success Rate", value: "99%", icon: TrendingUp },
  ];

  const features = [
    {
      icon: Package,
      title: "Premium Quality",
      description: "High-grade materials and precision engineering in every product",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Reliable Service",
      description: "Trusted by industries worldwide for our commitment to excellence",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Quick turnaround times without compromising on quality",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Wrench,
      title: "Expert Support",
      description: "24/7 technical assistance from our experienced team",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Settings,
      title: "Custom Solutions",
      description: "Tailored machinery to meet your specific requirements",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Target,
      title: "Precision Engineering",
      description: "State-of-the-art technology for superior performance",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      company: "Kumar Manufacturing Ltd.",
      content: "Outstanding quality and service. RN Industries has been our trusted partner for over 10 years.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      company: "Sharma Industries",
      content: "The machinery is top-notch and the support team is always responsive. Highly recommended!",
      rating: 5
    },
    {
      name: "Amit Patel",
      company: "Patel Engineering Works",
      content: "Best industrial equipment supplier in Delhi. Their attention to detail is impressive.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-32 md:py-48 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Factory className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Industrial Excellence Since 2000</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Powering{" "}
              <span className="gradient-text">
                Industries
              </span>
              <br />
              Forward
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-4 animate-fade-in max-w-3xl mx-auto" style={{ animationDelay: "0.2s" }}>
              Premium industrial machinery & equipment for modern manufacturing.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-8 animate-fade-in max-w-3xl mx-auto" style={{ animationDelay: "0.3s" }}>
              Built for performance, engineered for reliability.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button 
                size="lg" 
                onClick={() => navigate("/products")} 
                className="group"
              >
                View Our Machinery
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/contact")}
                className="group"
              >
                <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="h-8 w-8 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base opacity-90">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="secondary">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Excellence in Every Aspect</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for all your industrial machinery needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="hover-lift glass group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="secondary">Testimonials</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trusted by leading industries across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="hover-lift"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Power Your Industry?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Get in touch with our experts today and discover how we can help transform your manufacturing operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/products")}
                className="group"
              >
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/contact")}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
              >
                <Phone className="mr-2 h-5 w-5" />
                Request Quote
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </section>

      <Footer />
    </div>
  );
}
