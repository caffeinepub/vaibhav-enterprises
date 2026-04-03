import Map "mo:core/Map";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type OldProduct = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    price : Nat;
    badge : Text;
    description : Text;
    imageUrl : Text;
  };

  type Product = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    price : Nat;
    badge : Text;
    description : Text;
    imageUrl : Text;
    stockQty : Nat;
    inStock : Bool;
  };

  type Enquiry = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    createdAt : Int;
  };

  let ADMIN_PW = "vaibhav@2210";

  // ── Compatibility stubs (M0169) ───────────────────────────────────────────
  stable var products     : Map.Map<Nat, OldProduct> = Map.empty<Nat, OldProduct>();
  stable var enquiries    : Map.Map<Nat, Enquiry>    = Map.empty<Nat, Enquiry>();
  stable var stockMap     : Map.Map<Nat, Nat>        = Map.empty<Nat, Nat>();
  stable var stableProducts  : [(Nat, OldProduct)] = [];
  stable var stableEnquiries : [(Nat, Enquiry)]    = [];
  stable var stableStockMap  : [(Nat, Nat)]        = [];
  stable var migrated : Bool = true;
  // ─────────────────────────────────────────────────────────────────────────

  // Primary persistent storage
  stable var productList  : [Product] = [];
  stable var enquiryList  : [Enquiry] = [];
  stable var nextId       : Nat = 1;
  stable var nextEnquiryId : Nat = 1;

  // ── Admin ─────────────────────────────────────────────────────────────────
  public query func checkAdminPassword(password : Text) : async Bool {
    password == ADMIN_PW
  };

  // ── Products ──────────────────────────────────────────────────────────────
  // update call (not query) so it always reads committed state across all replicas
  public shared func getProducts() : async [Product] {
    productList
  };

  public shared func getProduct(id : Nat) : async ?Product {
    Array.find<Product>(productList, func(p) { p.id == id })
  };

  public shared func addProduct(password : Text, product : Product) : async Bool {
    if (password != ADMIN_PW) { return false };
    let id = nextId;
    nextId += 1;
    productList := Array.append<Product>(productList, [{
      id;
      name = product.name;
      brand = product.brand;
      category = product.category;
      price = product.price;
      badge = product.badge;
      description = product.description;
      imageUrl = product.imageUrl;
      stockQty = product.stockQty;
      inStock = product.inStock;
    }]);
    true
  };

  public shared func updateProduct(password : Text, id : Nat, product : Product) : async Bool {
    if (password != ADMIN_PW) { return false };
    var found = false;
    productList := Array.map<Product, Product>(productList, func(p) {
      if (p.id == id) {
        found := true;
        { id; name = product.name; brand = product.brand; category = product.category;
          price = product.price; badge = product.badge; description = product.description;
          imageUrl = product.imageUrl; stockQty = product.stockQty; inStock = product.inStock }
      } else { p }
    });
    found
  };

  public shared func deleteProduct(password : Text, id : Nat) : async Bool {
    if (password != ADMIN_PW) { return false };
    let before = productList.size();
    productList := Array.filter<Product>(productList, func(p) { p.id != id });
    productList.size() < before
  };

  // ── Stock ─────────────────────────────────────────────────────────────────
  public shared func setProductStock(password : Text, id : Nat, quantity : Nat) : async Bool {
    if (password != ADMIN_PW) { return false };
    productList := Array.map<Product, Product>(productList, func(p) {
      if (p.id == id) {
        { id = p.id; name = p.name; brand = p.brand; category = p.category;
          price = p.price; badge = p.badge; description = p.description;
          imageUrl = p.imageUrl; stockQty = quantity; inStock = quantity > 0 }
      } else { p }
    });
    true
  };

  public shared func getProductStock(id : Nat) : async Nat {
    switch (Array.find<Product>(productList, func(p) { p.id == id })) {
      case (?p) { p.stockQty };
      case null  { 0 };
    }
  };

  public shared func getAllStock() : async [(Nat, Nat)] {
    Array.map<Product, (Nat, Nat)>(productList, func(p) { (p.id, p.stockQty) })
  };

  // ── Enquiries ─────────────────────────────────────────────────────────────
  public shared func submitEnquiry(name : Text, phone : Text, message : Text) : async Nat {
    let id = nextEnquiryId;
    nextEnquiryId += 1;
    enquiryList := Array.append<Enquiry>(enquiryList, [
      { id; name; phone; message; createdAt = Time.now() }
    ]);
    id
  };

  // update call (not query) so enquiries are always current
  public shared func getEnquiries(password : Text) : async [Enquiry] {
    if (password != ADMIN_PW) { return [] };
    enquiryList
  };

  public shared func deleteEnquiry(password : Text, id : Nat) : async Bool {
    if (password != ADMIN_PW) { return false };
    let before = enquiryList.size();
    enquiryList := Array.filter<Enquiry>(enquiryList, func(e) { e.id != id });
    enquiryList.size() < before
  };

  // ── Seed ──────────────────────────────────────────────────────────────────
  public shared func seedProducts(password : Text) : async Bool {
    if (password != ADMIN_PW) { return false };
    if (productList.size() > 0) { return false };
    productList := [
      { id=1;  name="Halonix Ceiling Fan";         brand="Halonix"; category="Fans";                  price=1800; badge="Bestseller";       description="Energy efficient ceiling fan.";    imageUrl=""; stockQty=10; inStock=true },
      { id=2;  name="Voltas Pedestal Fan";          brand="Voltas";  category="Fans";                  price=2200; badge="New Arrival";      description="Silent pedestal fan.";           imageUrl=""; stockQty=5;  inStock=true },
      { id=3;  name="Voltas Instant Geyser";        brand="Voltas";  category="Geysers";              price=3500; badge="Bestseller";       description="Instant water heater.";          imageUrl=""; stockQty=8;  inStock=true },
      { id=4;  name="Voltas Storage Geyser 25L";    brand="Voltas";  category="Geysers";              price=4999; badge="Large Size";       description="High-capacity water heater.";    imageUrl=""; stockQty=3;  inStock=true },
      { id=5;  name="Voltas Desert Cooler";         brand="Voltas";  category="Coolers";              price=6500; badge="Bestseller";       description="Desert air cooler.";             imageUrl=""; stockQty=6;  inStock=true },
      { id=6;  name="Pigeon Personal Cooler";       brand="Pigeon";  category="Coolers";              price=2800; badge="New Arrival";      description="Compact personal cooler.";       imageUrl=""; stockQty=4;  inStock=true },
      { id=7;  name="Halonix LED Bulb 9W";          brand="Halonix"; category="Lights";               price=120;  badge="Bestseller";       description="Energy saving LED bulb.";        imageUrl=""; stockQty=50; inStock=true },
      { id=8;  name="Halonix Panel Light";          brand="Halonix"; category="Lights";               price=599;  badge="Sale";             description="LED panel light.";               imageUrl=""; stockQty=15; inStock=true },
      { id=9;  name="Pigeon Mixer Grinder";         brand="Pigeon";  category="Home Appliances";      price=2200; badge="Bestseller";       description="3 jar mixer grinder.";           imageUrl=""; stockQty=7;  inStock=true },
      { id=10; name="Varmora Storage Container Set";brand="Varmora"; category="Varmora Plastic Items";price=950;  badge="Kitchen Essential";description="Airtight plastic containers.";    imageUrl=""; stockQty=20; inStock=true },
      { id=11; name="Varmora Water Jug";            brand="Varmora"; category="Varmora Plastic Items";price=350;  badge="Summer Special";   description="Leak proof water jug.";          imageUrl=""; stockQty=25; inStock=true }
    ];
    nextId := 12;
    true
  };
};
