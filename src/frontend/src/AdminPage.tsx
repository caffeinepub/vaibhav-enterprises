import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  Inbox,
  Loader2,
  LogOut,
  PackageSearch,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend.d.ts";

interface Enquiry {
  id: bigint;
  name: string;
  phone: string;
  message: string;
  createdAt: bigint;
}
import { useActor } from "./hooks/useActor";

const CATEGORIES = [
  "Fans",
  "Geysers",
  "Coolers",
  "Lights",
  "Home Appliances",
  "Varmora Plastic Items",
];

const ADMIN_PASSWORD = "vaibhav@2210";

type ProductFormData = {
  name: string;
  brand: string;
  category: string;
  price: string;
  badge: string;
  description: string;
  imageUrl: string;
};

const EMPTY_FORM: ProductFormData = {
  name: "",
  brand: "",
  category: "Fans",
  price: "",
  badge: "",
  description: "",
  imageUrl: "",
};

export default function AdminPage() {
  const { actor, isFetching } = useActor();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("adminLoggedIn") === "true",
  );
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  // Product dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Enquiries
  const [activeTab, setActiveTab] = useState("products");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [deletingEnquiryId, setDeletingEnquiryId] = useState<bigint | null>(
    null,
  );

  const getAdminPassword = () =>
    sessionStorage.getItem("adminPassword") || ADMIN_PASSWORD;

  const fetchProducts = useCallback(async () => {
    if (!actor) return;
    setLoadingProducts(true);
    try {
      const data = await actor.getProducts();
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [actor]);

  const fetchEnquiries = useCallback(async () => {
    if (!actor) return;
    setLoadingEnquiries(true);
    try {
      const data = await actor.getEnquiries(
        sessionStorage.getItem("adminPassword") || ADMIN_PASSWORD,
      );
      setEnquiries(data);
    } catch {
      toast.error("Failed to load enquiries");
    } finally {
      setLoadingEnquiries(false);
    }
  }, [actor]);

  useEffect(() => {
    if (isLoggedIn && actor && !isFetching) {
      fetchProducts();
    }
  }, [isLoggedIn, actor, isFetching, fetchProducts]);

  const handleDeleteEnquiry = async (id: bigint) => {
    if (!actor) return;
    setDeletingEnquiryId(id);
    try {
      await actor.deleteEnquiry(
        sessionStorage.getItem("adminPassword") || ADMIN_PASSWORD,
        id,
      );
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Enquiry deleted");
    } catch {
      toast.error("Failed to delete enquiry");
    } finally {
      setDeletingEnquiryId(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      // Check password locally first - fast and reliable
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("adminLoggedIn", "true");
        sessionStorage.setItem("adminPassword", password);
        setIsLoggedIn(true);
        toast.success("Welcome back!");
        return;
      }
      // If not matching local password, try backend (for future password changes)
      if (actor) {
        const ok = await actor.checkAdminPassword(password);
        if (ok) {
          localStorage.setItem("adminLoggedIn", "true");
          sessionStorage.setItem("adminPassword", password);
          setIsLoggedIn(true);
          toast.success("Welcome back!");
        } else {
          toast.error("Incorrect password. Please try again.");
        }
      } else {
        toast.error("Incorrect password. Please try again.");
      }
    } catch {
      toast.error("Incorrect password. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminPassword");
    setIsLoggedIn(false);
    setProducts([]);
  };

  const handleSeed = async () => {
    if (!actor) return;
    setSeedLoading(true);
    try {
      await actor.seedProducts(getAdminPassword());
      await fetchProducts();
      toast.success("Products seeded successfully!");
    } catch {
      toast.error("Seeding failed.");
    } finally {
      setSeedLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      badge: product.badge,
      description: product.description,
      imageUrl: product.imageUrl,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setSaving(true);
    const pwd = getAdminPassword();
    const productData: Product = {
      id: editProduct ? editProduct.id : BigInt(0),
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      price: BigInt(Math.round(Number(formData.price) || 0)),
      badge: formData.badge.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim(),
    };
    try {
      if (editProduct) {
        await actor.updateProduct(pwd, editProduct.id, productData);
        toast.success("Product updated!");
      } else {
        await actor.addProduct(pwd, productData);
        toast.success("Product added!");
      }
      setDialogOpen(false);
      await fetchProducts();
    } catch {
      toast.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !deleteTarget) return;
    setDeleting(true);
    try {
      await actor.deleteProduct(getAdminPassword(), deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await fetchProducts();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.065 236) 0%, oklch(0.30 0.072 236) 100%)",
        }}
      >
        <Toaster />
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "oklch(0.65 0.11 191)" }}
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-gray-400 text-sm mt-1">
              Vaibhav Enterprises Admin Panel
            </p>
          </div>

          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{ backgroundColor: "oklch(0.18 0.055 236)" }}
          >
            <form
              onSubmit={handleLogin}
              className="space-y-5"
              data-ocid="admin.login.form"
            >
              <div>
                <Label
                  htmlFor="admin-password"
                  className="text-gray-300 text-sm mb-1.5 block"
                >
                  Password
                </Label>
                <Input
                  id="admin-password"
                  data-ocid="admin.password.input"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                data-ocid="admin.login.submit_button"
                className="w-full font-semibold"
                disabled={loginLoading}
                style={{
                  backgroundColor: "oklch(0.65 0.11 191)",
                  color: "white",
                }}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>

          <div className="text-center mt-6">
            <a
              href="/"
              className="text-gray-400 text-sm hover:text-white transition-colors inline-flex items-center gap-1"
              data-ocid="admin.home.link"
            >
              <Home className="w-3.5 h-3.5" />
              Back to Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Admin Header */}
      <header
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: "oklch(0.25 0.065 236)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.65 0.11 191)" }}
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">
                Vaibhav Enterprises
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.65 0.11 191)" }}
              >
                Admin Panel
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              data-ocid="admin.home.link"
              className="hidden sm:inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              View Website
            </a>
            <Button
              variant="outline"
              size="sm"
              data-ocid="admin.logout.button"
              onClick={handleLogout}
              className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            if (
              v === "enquiries" &&
              enquiries.length === 0 &&
              !loadingEnquiries
            ) {
              fetchEnquiries();
            }
          }}
          className="w-full"
        >
          <TabsList
            className="mb-8 h-auto p-1"
            style={{ backgroundColor: "oklch(0.92 0.02 236)" }}
          >
            <TabsTrigger
              value="products"
              data-ocid="admin.products.tab"
              className="gap-2 data-[state=active]:text-white"
              style={{
                ["--tw-data-active-bg" as string]: "oklch(0.30 0.072 236)",
              }}
            >
              <PackageSearch className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="enquiries"
              data-ocid="admin.enquiries.tab"
              className="gap-2"
            >
              <Inbox className="w-4 h-4" />
              Enquiries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {/* Stats + Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {loadingProducts
                    ? "Loading..."
                    : `${products.length} product${products.length !== 1 ? "s" : ""} total`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {products.length === 0 && !loadingProducts && (
                  <Button
                    variant="outline"
                    data-ocid="admin.seed.button"
                    onClick={handleSeed}
                    disabled={seedLoading}
                  >
                    {seedLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PackageSearch className="mr-2 h-4 w-4" />
                    )}
                    Seed Products
                  </Button>
                )}
                <Button
                  data-ocid="admin.add_product.open_modal_button"
                  onClick={openAdd}
                  style={{
                    backgroundColor: "oklch(0.30 0.072 236)",
                    color: "white",
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Products Table */}
            {loadingProducts ? (
              <div
                className="flex items-center justify-center h-64"
                data-ocid="admin.products.loading_state"
              >
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: "oklch(0.30 0.072 236)" }}
                />
              </div>
            ) : products.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-64 text-center"
                data-ocid="admin.products.empty_state"
              >
                <PackageSearch className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-600 mb-1">
                  No products yet
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Add your first product or seed with sample data.
                </p>
                <Button
                  onClick={handleSeed}
                  disabled={seedLoading}
                  style={{
                    backgroundColor: "oklch(0.30 0.072 236)",
                    color: "white",
                  }}
                >
                  {seedLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PackageSearch className="mr-2 h-4 w-4" />
                  )}
                  Seed Sample Products
                </Button>
              </div>
            ) : (
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                data-ocid="admin.products.table"
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Product
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Brand
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Category
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Price
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Badge
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, i) => (
                        <TableRow
                          key={product.id.toString()}
                          data-ocid={`admin.products.row.${i + 1}`}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ProductThumb product={product} />
                              <span className="font-medium text-gray-900 text-sm">
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {product.brand}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            {product.badge ? (
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: "oklch(0.65 0.11 191)",
                                  color: "white",
                                }}
                              >
                                {product.badge}
                              </Badge>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-ocid={`admin.products.edit_button.${i + 1}`}
                                onClick={() => openEdit(product)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-ocid={`admin.products.delete_button.${i + 1}`}
                                onClick={() => setDeleteTarget(product)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="enquiries">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enquiries</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {loadingEnquiries
                    ? "Loading..."
                    : `${enquiries.length} enquir${enquiries.length !== 1 ? "ies" : "y"} received`}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={fetchEnquiries}
                disabled={loadingEnquiries}
                data-ocid="admin.enquiries.refresh.button"
              >
                {loadingEnquiries ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Inbox className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            {loadingEnquiries ? (
              <div
                className="flex items-center justify-center h-64"
                data-ocid="admin.enquiries.loading_state"
              >
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: "oklch(0.30 0.072 236)" }}
                />
              </div>
            ) : enquiries.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-64 text-center"
                data-ocid="admin.enquiries.empty_state"
              >
                <Inbox className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-600 mb-1">
                  No enquiries yet
                </h3>
                <p className="text-gray-400 text-sm">
                  Enquiries from the website will appear here.
                </p>
              </div>
            ) : (
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                data-ocid="admin.enquiries.table"
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Phone
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Message
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enquiries.map((enquiry, i) => (
                        <TableRow
                          key={enquiry.id.toString()}
                          data-ocid={`admin.enquiries.row.item.${i + 1}`}
                        >
                          <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                            {enquiry.name}
                          </TableCell>
                          <TableCell className="text-gray-600 whitespace-nowrap">
                            {enquiry.phone}
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-xs">
                            <p className="truncate max-w-xs">
                              {enquiry.message}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              data-ocid={`admin.enquiries.delete_button.${i + 1}`}
                              onClick={() => handleDeleteEnquiry(enquiry.id)}
                              disabled={deletingEnquiryId === enquiry.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              {deletingEnquiryId === enquiry.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="admin.product.dialog">
          <DialogHeader>
            <DialogTitle>
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="p-name">Product Name *</Label>
                <Input
                  id="p-name"
                  data-ocid="admin.product.name.input"
                  placeholder="e.g. Halonix 9W LED Bulb"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-brand">Brand *</Label>
                <Input
                  id="p-brand"
                  data-ocid="admin.product.brand.input"
                  placeholder="e.g. Halonix"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, brand: e.target.value }))
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-price">Price (₹) *</Label>
                <Input
                  id="p-price"
                  data-ocid="admin.product.price.input"
                  type="number"
                  placeholder="e.g. 499"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, price: e.target.value }))
                  }
                  required
                  min="0"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="p-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData((f) => ({ ...f, category: v }))
                  }
                >
                  <SelectTrigger
                    id="p-category"
                    data-ocid="admin.product.category.select"
                    className="mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="p-badge">Badge (optional)</Label>
                <Input
                  id="p-badge"
                  data-ocid="admin.product.badge.input"
                  placeholder="e.g. Best Seller, New, Sale"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, badge: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="p-description">Description (optional)</Label>
                <Textarea
                  id="p-description"
                  data-ocid="admin.product.description.textarea"
                  placeholder="Short product description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="p-image">Image URL (optional)</Label>
                <Input
                  id="p-image"
                  data-ocid="admin.product.image.input"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="admin.product.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin.product.save_button"
                disabled={saving}
                style={{
                  backgroundColor: "oklch(0.30 0.072 236)",
                  color: "white",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editProduct ? (
                  "Save Changes"
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete.confirm_button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductThumb({ product }: { product: Product }) {
  const fallback = getCategoryFallback(product.category);
  const src =
    !product.imageUrl || product.imageUrl.startsWith("https://example.com")
      ? fallback
      : product.imageUrl;

  return (
    <img
      src={src}
      alt={product.name}
      className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100"
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallback;
      }}
    />
  );
}

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
