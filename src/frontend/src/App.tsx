import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BadgeCheck,
  ChevronRight,
  Flame,
  Headphones,
  Heart,
  Home,
  Layers,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Thermometer,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import AdminPage from "./AdminPage";
import type { Product } from "./backend.d.ts";
import { useActor } from "./hooks/useActor";

import halonixLogo from "../public/assets/generated/brand-halonix-logo.dim_300x150.png";
import indecoolLogo from "../public/assets/generated/brand-indecool-logo.dim_300x150.png";
import macawLogo from "../public/assets/generated/brand-macaw-logo.dim_300x150.png";
import pigeonLogo from "../public/assets/generated/brand-pigeon-logo.dim_300x150.png";
import varmoraLogo from "../public/assets/generated/brand-varmora-logo.dim_300x150.png";
import voltasLogo from "../public/assets/generated/brand-voltas-logo.dim_300x150.png";
import sarawagiLogo from "../public/assets/uploads/img-20230511-wa0048-019d3872-0898-7358-96fa-1133dd8da177-1.jpg";

// ── Router ────────────────────────────────────────────────────────────────────
// Simple pathname-based routing without needing react-router-dom
function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  return pathname;
}

const CATEGORIES_LIST = [
  "All",
  "Fans",
  "Geysers",
  "Coolers",
  "Lights",
  "Home Appliances",
  "Varmora Plastic Items",
];

const CATEGORIES = [
  { id: "fans", label: "Fans", icon: Wind, desc: "Ceiling, Table & Pedestal" },
  { id: "geysers", label: "Geysers", icon: Flame, desc: "Instant & Storage" },
  {
    id: "coolers",
    label: "Coolers",
    icon: Thermometer,
    desc: "Personal & Desert",
  },
  {
    id: "lights",
    label: "Lighting",
    icon: Lightbulb,
    desc: "LED Bulbs & Panels",
  },
  {
    id: "appliances",
    label: "Home Appliances",
    icon: Home,
    desc: "Kitchen & Household",
  },
  {
    id: "varmora",
    label: "Varmora Plastic Items",
    icon: Layers,
    desc: "Boxes, Containers & Storage",
  },
];

const BRANDS = [
  {
    name: "Pigeon",
    tagline: "By Stovekraft",
    products: "Cookers, Geysers, Appliances",
    color: "from-blue-700 to-blue-800",
    logo: pigeonLogo,
  },
  {
    name: "Voltas",
    tagline: "Tata Enterprise",
    products: "Geysers, Coolers, ACs",
    color: "from-blue-500 to-blue-600",
    logo: voltasLogo,
  },
  {
    name: "Halonix",
    tagline: "Lighting Solutions",
    products: "LED Bulbs, Tube Lights, Panels",
    color: "from-yellow-500 to-yellow-600",
    logo: halonixLogo,
  },
  {
    name: "Varmora",
    tagline: "Plastic Products",
    products: "Plastic Boxes, Containers, Storage",
    color: "from-purple-600 to-purple-700",
    logo: varmoraLogo,
  },
  {
    name: "Sarawagi",
    tagline: "Think Better, Think Us",
    products: "Quality Products",
    color: "from-green-600 to-green-700",
    logo: sarawagiLogo,
  },
  {
    name: "Macaw",
    tagline: "Home Appliances",
    products: "Fans, Coolers, Appliances",
    color: "from-orange-500 to-orange-600",
    logo: macawLogo,
  },
  {
    name: "Indecool",
    tagline: "Cooling Solutions",
    products: "Air Coolers",
    color: "from-cyan-600 to-cyan-700",
    logo: indecoolLogo,
  },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    city: "Bhopal",
    rating: 5,
    review:
      "Excellent service and quality products. Got my ceiling fan installed quickly. Very happy with the purchase!",
  },
  {
    name: "Priya Sharma",
    city: "Bhopal",
    rating: 5,
    review:
      "Great deals on Halonix fans and lights. The staff is very helpful and the prices are the best in town.",
  },
  {
    name: "Amit Deshmukh",
    city: "Bhopal",
    rating: 4,
    review:
      "Bought a Pigeon chimney from here. Good quality, genuine product, and prompt after-sales support. Recommended!",
  },
];

const WHY_CHOOSE = [
  {
    icon: BadgeCheck,
    title: "100% Genuine Products",
    desc: "Every product is sourced directly from authorized brand distributors.",
  },
  {
    icon: ShieldCheck,
    title: "Authorized Distributor",
    desc: "Official distributor of Pigeon, Halonix, Voltas & Varmora brands.",
  },
  {
    icon: Tag,
    title: "Best Prices",
    desc: "Competitive pricing with exclusive deals and seasonal offers.",
  },
  {
    icon: Headphones,
    title: "After-Sales Support",
    desc: "Dedicated support team for installation, warranty & service queries.",
  },
];

const QUICK_LINKS = ["Home", "Shop", "About Us", "Contact", "Brands"];

function getCategoryFallback(category: string) {
  const c = category.toLowerCase();
  if (c.includes("fan")) return "/assets/generated/product-fan.dim_300x300.jpg";
  if (c.includes("geyser"))
    return "/assets/generated/product-geyser.dim_300x300.jpg";
  if (c.includes("cooler"))
    return "/assets/generated/product-cooler.dim_300x300.jpg";
  if (c.includes("light"))
    return "/assets/generated/product-led-bulb.dim_300x300.jpg";
  if (c.includes("appliance"))
    return "/assets/generated/product-mixer.dim_300x300.jpg";
  if (c.includes("varmora") || c.includes("plastic"))
    return "/assets/generated/product-varmora-plastic.dim_300x300.jpg";
  return "/assets/generated/product-cookware.dim_300x300.jpg";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : s - 0.5 <= rating
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({rating})</span>
    </div>
  );
}

function ProductCard({
  product,
  index,
  onEnquire,
}: { product: Product; index: number; onEnquire: (name: string) => void }) {
  const fallback = getCategoryFallback(product.category);
  const src =
    !product.imageUrl || product.imageUrl.startsWith("https://example.com")
      ? fallback
      : product.imageUrl;

  return (
    <motion.div
      data-ocid={`products.item.${index + 1}`}
      className="bg-card rounded-xl shadow-card overflow-hidden group hover:shadow-hero transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.07 }}
    >
      <div className="relative overflow-hidden">
        <img
          src={src}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallback;
          }}
        />
        {product.badge && (
          <Badge
            className="absolute top-3 left-3 text-xs font-semibold"
            style={{ backgroundColor: "oklch(0.45 0.14 236)", color: "white" }}
          >
            {product.badge}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "oklch(0.45 0.14 236)" }}
        >
          {product.brand} · {product.category}
        </p>
        <h3 className="font-semibold text-navy text-sm mb-2 leading-tight">
          {product.name}
        </h3>
        <StarRating rating={4.4} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-navy">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <Button
            type="button"
            size="sm"
            data-ocid={`products.item.${index + 1}.button`}
            className="text-xs font-semibold"
            style={{ backgroundColor: "oklch(0.45 0.14 236)", color: "white" }}
            onClick={() => onEnquire(product.name)}
          >
            Enquire
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function MainSite() {
  const { actor, isFetching } = useActor();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [newsletter, setNewsletter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = useCallback(async () => {
    if (!actor) {
      setLoadingProducts(false);
      return;
    }
    setLoadingProducts(true);
    try {
      const data = await actor.getProducts();
      setProducts(data);
    } catch {
      // silently fail
    } finally {
      setLoadingProducts(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !isFetching) {
      fetchProducts();
    }
  }, [actor, isFetching, fetchProducts]);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "categories", label: "Shop" },
    { id: "products", label: "Products" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setActiveSection(id);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleAddToCart = (name: string) => {
    setCartCount((c) => c + 1);
    toast.success(`${name} added to enquiry list!`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Unable to connect. Please try again.");
      return;
    }
    setSubmitting(true);
    try {
      await actor.submitEnquiry(form.name, form.phone, form.message);
      toast.success("Your enquiry has been sent! We'll contact you shortly.");
      setForm({ name: "", phone: "", message: "" });
    } catch {
      toast.error("Failed to send enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Subscribed successfully!");
    setNewsletter("");
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy shadow-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              type="button"
              className="flex items-center gap-3"
              onClick={() => scrollTo("home")}
              data-ocid="nav.home.link"
            >
              <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg leading-tight">
                  Vaibhav Enterprises
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.72 0.06 236)" }}
                >
                  Home Appliances & Varmora Products
                </div>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  data-ocid={`nav.${link.id}.link`}
                  onClick={() => scrollTo(link.id)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? ""
                      : "text-gray-200 hover:text-white"
                  }`}
                  style={
                    activeSection === link.id
                      ? { color: "oklch(0.45 0.14 236)" }
                      : {}
                  }
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="tel:+917000776389"
                className="hidden md:flex items-center gap-1.5 text-white text-sm"
              >
                <Phone
                  className="w-4 h-4"
                  style={{ color: "oklch(0.45 0.14 236)" }}
                />
                <span>+91 70007 76389</span>
              </a>
              <button
                type="button"
                data-ocid="header.cart.button"
                className="relative p-2 text-white"
                onClick={() =>
                  toast.info(`${cartCount} item(s) in enquiry list`)
                }
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                className="lg:hidden p-2 text-white"
                data-ocid="nav.mobile.toggle"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
              style={{ backgroundColor: "oklch(0.22 0.065 236)" }}
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    data-ocid={`nav.mobile.${link.id}.link`}
                    onClick={() => scrollTo(link.id)}
                    className="text-left text-white py-2 border-b border-white/10 font-medium"
                  >
                    {link.label}
                  </button>
                ))}
                <a
                  href="tel:+917000776389"
                  className="flex items-center gap-2 pt-1"
                  style={{ color: "oklch(0.45 0.14 236)" }}
                >
                  <Phone className="w-4 h-4" />
                  +91 70007 76389
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div
          className="relative min-h-[90vh] flex items-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.065 236) 0%, oklch(0.45 0.14 236) 50%, oklch(0.25 0.065 236) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('/assets/generated/hero-home-appliances.dim_1400x600.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: "oklch(0.45 0.14 236 / 0.15)",
                    borderColor: "oklch(0.45 0.14 236 / 0.40)",
                    color: "oklch(0.72 0.06 236)",
                  }}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Authorized Dealer & Distributor
                </span>
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: "oklch(0.55 0.15 140 / 0.15)",
                    borderColor: "oklch(0.55 0.15 140 / 0.40)",
                    color: "oklch(0.70 0.12 140)",
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  GeM Registered Seller
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Welcome to
                <br />
                <span className="text-white">Vaibhav</span> Enterprises
              </motion.h1>

              <motion.p
                className="text-lg text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Your trusted Authorized Distributor of Halonix Fans and Lights,
                Voltas Geysers and Coolers, Pigeon Home Appliances, Varmora
                Plastic Items
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button
                  type="button"
                  data-ocid="hero.primary_button"
                  size="lg"
                  className="font-semibold px-8"
                  style={{
                    backgroundColor: "oklch(0.45 0.14 236)",
                    color: "white",
                  }}
                  onClick={() => scrollTo("products")}
                >
                  Explore Our Products
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  type="button"
                  data-ocid="hero.contact.button"
                  size="lg"
                  variant="ghost"
                  className="font-semibold px-8 border border-white/30 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => scrollTo("contact")}
                >
                  Contact Us
                </Button>
              </motion.div>

              <motion.div
                className="mt-12 flex flex-wrap gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {[
                  "500+ Products",
                  "Serving Since 2021",
                  "5000+ Happy Customers",
                ].map((stat) => (
                  <div key={stat} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                    />
                    <span className="text-gray-300 text-sm font-medium">
                      {stat}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section
        className="py-16"
        style={{ backgroundColor: "oklch(0.97 0.008 236)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.45 0.14 236)" }}
            >
              Authorized Distributor
            </p>
            <h2 className="text-3xl font-bold text-navy">Our Trusted Brands</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand.name}
                data-ocid={`brands.item.${i + 1}`}
                className="bg-card rounded-xl shadow-card p-6 text-center hover:shadow-hero transition-all duration-300 group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden mb-4 group-hover:scale-110 transition-transform bg-white flex items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <h3 className="font-bold text-navy text-lg mb-0.5">
                  {brand.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {brand.tagline}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.45 0.14 236)" }}
                >
                  {brand.products}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.45 0.14 236)" }}
            >
              Browse
            </p>
            <h2 className="text-3xl font-bold text-navy">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                type="button"
                key={cat.id}
                data-ocid={`categories.item.${i + 1}`}
                className="group cursor-pointer text-left"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => scrollTo("products")}
              >
                <div className="rounded-xl border border-border p-5 text-center hover:shadow-card transition-all">
                  <div
                    className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: "oklch(0.45 0.14 236 / 0.08)" }}
                  >
                    <cat.icon
                      className="w-6 h-6"
                      style={{ color: "oklch(0.45 0.14 236)" }}
                    />
                  </div>
                  <p className="font-semibold text-sm text-navy">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section
        id="products"
        className="py-16"
        style={{ backgroundColor: "oklch(0.97 0.008 236)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.45 0.14 236)" }}
            >
              Our Collection
            </p>
            <h2 className="text-3xl font-bold text-navy">All Products</h2>
          </div>

          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto pb-2">
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-max min-w-full"
            >
              <TabsList className="flex gap-1 h-auto p-1 flex-wrap">
                {CATEGORIES_LIST.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    data-ocid="products.filter.tab"
                    className="text-xs px-3 py-1.5 rounded-md"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {loadingProducts ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              data-ocid="products.loading_state"
            >
              {[...Array(8)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="bg-card rounded-xl overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16" data-ocid="products.empty_state">
              <p className="text-muted-foreground">
                No products in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={i}
                  onEnquire={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enquiry */}
      <section
        id="enquiry"
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.065 236), oklch(0.45 0.14 236))",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.72 0.06 236)" }}
            >
              Get In Touch
            </p>
            <h2 className="text-3xl font-bold text-white">Send an Enquiry</h2>
            <p className="text-gray-300 mt-2 text-sm">
              Interested in a product? Fill in the details and we'll get back to
              you soon.
            </p>
          </div>
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: "oklch(0.28 0.07 236)",
              border: "1px solid oklch(0.4 0.1 236)",
            }}
          >
            <form
              onSubmit={handleFormSubmit}
              className="space-y-5"
              data-ocid="enquiry.form"
            >
              <div>
                <label
                  htmlFor="enquiry-name"
                  className="block text-sm font-medium text-gray-200 mb-1.5"
                >
                  Your Name
                </label>
                <Input
                  id="enquiry-name"
                  data-ocid="enquiry.input"
                  className="text-white"
                  placeholder="e.g. Rajesh Kumar"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enquiry-phone"
                  className="block text-sm font-medium text-gray-200 mb-1.5"
                >
                  Phone Number
                </label>
                <Input
                  id="enquiry-phone"
                  data-ocid="enquiry.input"
                  className="text-white"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enquiry-message"
                  className="block text-sm font-medium text-gray-200 mb-1.5"
                >
                  Message / Product Enquiry
                </label>
                <Textarea
                  id="enquiry-message"
                  data-ocid="enquiry.textarea"
                  className="text-white"
                  placeholder="Tell us what you're looking for..."
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                data-ocid="enquiry.submit_button"
                className="w-full font-semibold py-2.5"
                disabled={submitting}
                style={{
                  backgroundColor: "oklch(0.45 0.14 236)",
                  color: "white",
                }}
              >
                {submitting ? "Sending..." : "Send Enquiry"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-0 overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[480px]">
          <div
            className="relative flex items-center justify-center p-12"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.065 236), oklch(0.45 0.14 236))",
            }}
          >
            <div
              className="absolute bottom-8 left-8 right-8 rounded-xl p-4 backdrop-blur-sm"
              style={{
                backgroundColor: "oklch(0.45 0.14 236 / 0.20)",
                border: "1px solid oklch(0.45 0.14 236 / 0.30)",
              }}
            >
              <p className="text-white font-semibold text-sm">
                🏆 Serving Customers Since 2021
              </p>
              <p className="text-gray-300 text-xs mt-0.5">
                Serving customers across the region
              </p>
            </div>
          </div>

          <div className="flex items-center p-10 lg:p-16 bg-card">
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "oklch(0.45 0.14 236)" }}
              >
                Who We Are
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">
                About Vaibhav Enterprises
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vaibhav Enterprises is a trusted name in home appliances and
                Varmora plastic products, serving customers with quality
                products at the best prices. We are an authorized distributor
                for leading brands — Pigeon, Halonix, Voltas, and Varmora. We
                are also a registered seller on Government e-Marketplace (GeM).
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                From fans and geysers to coolers, lights, kitchen appliances,
                and a wide range of Varmora plastic products — we stock
                everything your home needs under one roof. Our commitment is to
                provide genuine products with excellent after-sales support.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Fans & Coolers",
                  "Geysers & Lights",
                  "Kitchen Appliances",
                  "Varmora Plastics",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "oklch(0.45 0.14 236 / 0.15)" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                      />
                    </div>
                    <span className="text-sm font-medium text-navy">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="py-16"
        style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.45 0.14 236)" }}
            >
              Our Promise
            </p>
            <h2 className="text-3xl font-bold text-white">Why Choose Us?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div
                key={item.title}
                data-ocid={`why.item.${i + 1}`}
                className="text-center p-6 rounded-xl"
                style={{ backgroundColor: "oklch(0.25 0.065 236)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "oklch(0.45 0.14 236 / 0.20)" }}
                >
                  <item.icon
                    className="w-7 h-7"
                    style={{ color: "oklch(0.45 0.14 236)" }}
                  />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.45 0.14 236)" }}
            >
              Testimonials
            </p>
            <h2 className="text-3xl font-bold text-navy">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                data-ocid={`testimonials.item.${i + 1}`}
                className="rounded-xl p-6 shadow-card"
                style={{ backgroundColor: "oklch(0.97 0.008 236)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <StarRating rating={t.rating} />
                <p className="text-muted-foreground text-sm leading-relaxed mt-4 mb-5">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-navy">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.065 236), oklch(0.45 0.14 236))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.72 0.06 236)" }}
            >
              Get In Touch
            </p>
            <h2 className="text-3xl font-bold text-white">Contact Us</h2>
          </div>
          <div>
            <div className="max-w-lg mx-auto">
              <h3 className="font-bold text-white text-xl mb-6">
                Visit Our Store
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Address</p>
                    <p className="text-gray-300 text-sm">
                      Plot No. 42, Radha Krishna Colony,
                      <br />
                      Near Jeevan Shri Hospital, Ayodhya Bypass Rd,
                      <br />
                      Karond, Bhopal - 462038
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                  >
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Phone</p>
                    <a
                      href="tel:+917000776389"
                      className="text-gray-300 text-sm"
                    >
                      +91 70007 76389
                    </a>
                    <br />
                    <a
                      href="tel:+919691963688"
                      className="text-gray-300 text-sm"
                    >
                      +91 96919 63688
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Email</p>
                    <a
                      href="mailto:sales.vaibhav2210@gmail.com"
                      className="text-gray-300 text-sm"
                    >
                      sales.vaibhav2210@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              <div
                className="mt-8 p-5 rounded-xl"
                style={{
                  backgroundColor: "oklch(0.45 0.14 236 / 0.25)",
                  border: "1px solid oklch(0.6 0.14 236 / 0.4)",
                }}
              >
                <p className="font-semibold text-white text-sm mb-1">
                  Business Hours
                </p>
                <p className="text-gray-300 text-sm">
                  Monday – Saturday: 11:00 AM – 6:00 PM
                </p>
                <p className="text-gray-300 text-sm">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "oklch(0.18 0.055 236)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.45 0.14 236)" }}
                >
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">
                  Vaibhav Enterprises
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Your trusted Authorized Distributor of Halonix Fans and Lights,
                Voltas Geysers and Coolers, Pigeon Home Appliances, Varmora
                Plastic Items. GeM Registered Seller. Serving Since 2021.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-400 text-sm">
                  <MapPin
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "oklch(0.45 0.14 236)" }}
                  />
                  Plot No. 42, Radha Krishna Colony, Karond, Bhopal 462038
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone
                    className="w-4 h-4"
                    style={{ color: "oklch(0.45 0.14 236)" }}
                  />
                  +91 70007 76389
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone
                    className="w-4 h-4"
                    style={{ color: "oklch(0.45 0.14 236)" }}
                  />
                  +91 96919 63688
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail
                    className="w-4 h-4"
                    style={{ color: "oklch(0.45 0.14 236)" }}
                  />
                  sales.vaibhav2210@gmail.com
                </li>
              </ul>
              <div className="mt-6">
                <h5 className="text-white text-sm font-semibold mb-2">
                  Newsletter
                </h5>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="Your email"
                    className="text-sm"
                    value={newsletter}
                    onChange={(e) => setNewsletter(e.target.value)}
                    style={{
                      backgroundColor: "oklch(0.22 0.065 236)",
                      borderColor: "oklch(0.25 0.065 236)",
                      color: "white",
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    style={{
                      backgroundColor: "oklch(0.45 0.14 236)",
                      color: "white",
                    }}
                  >
                    Go
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTopColor: "oklch(0.45 0.14 236)",
            borderTopWidth: "1px",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Vaibhav Enterprises. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                data-ocid="footer.admin.link"
                className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
              >
                Admin
              </a>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                Built with{" "}
                <Heart
                  className="w-3.5 h-3.5 fill-current"
                  style={{ color: "oklch(0.45 0.14 236)" }}
                />{" "}
                using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <AdminPage />;
  }

  return <MainSite />;
}
