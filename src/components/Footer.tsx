import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                RN
              </div>
              <span className="text-xl font-bold">RN INDUSTRIES</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Leading manufacturer of industrial machinery, providing high-quality equipment for factories and manufacturing units.
            </p>
            <p className="text-sm font-medium text-primary">Powering Industries Forward</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Our Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Request Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+919599184546" className="text-muted-foreground hover:text-primary transition-colors">
                  +91 9599184546
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:vermaravinder.515@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                  vermaravinder.515@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  H-3/318, Kunwar Singh Nagar, Gali No. 6, Nangloi, Delhi-41
                </span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Monday - Friday</span>
                <span className="font-medium">9:00 AM - 9:00 PM</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Saturday- Sunday</span>
                <span className="font-medium">9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2025 RN Industries. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
