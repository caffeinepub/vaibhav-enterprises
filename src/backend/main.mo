import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    price : Nat;
    badge : Text;
    description : Text;
    imageUrl : Text;
  };

  type Enquiry = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    createdAt : Int;
  };

  // ── Stable backup arrays (written in preupgrade, read in postupgrade) ─────
  stable var stableProducts : [(Nat, Product)] = [];
  stable var stableEnquiries : [(Nat, Enquiry)] = [];
  stable var stableStockMap : [(Nat, Nat)] = [];

  // ── ID counters ───────────────────────────────────────────────────────────
  stable var nextId : Nat = 1;
  stable var nextEnquiryId : Nat = 1;

  // ── In-memory working maps ────────────────────────────────────────────────
  var products : Map.Map<Nat, Product> = Map.empty<Nat, Product>();
  var enquiries : Map.Map<Nat, Enquiry> = Map.empty<Nat, Enquiry>();
  var stockMap : Map.Map<Nat, Nat> = Map.empty<Nat, Nat>();

  let ADMIN_PW = "vaibhav@2210";

  // ── Upgrade hooks — THE CRITICAL FIX ─────────────────────────────────────
  // preupgrade: save working maps into stable arrays BEFORE every upgrade
  system func preupgrade() {
    stableProducts := products.entries().toArray();
    stableEnquiries := enquiries.entries().toArray();
    stableStockMap := stockMap.entries().toArray();
  };

  // postupgrade: restore working maps from stable arrays AFTER every upgrade
  system func postupgrade() {
    for ((k, v) in stableProducts.vals()) { products.add(k, v) };
    for ((k, v) in stableEnquiries.vals()) { enquiries.add(k, v) };
    for ((k, v) in stableStockMap.vals()) { stockMap.add(k, v) };
  };

  // ── Admin auth ────────────────────────────────────────────────────────────
  public shared func checkAdminPassword(password : Text) : async Bool {
    password == ADMIN_PW
  };

  // ── Products ──────────────────────────────────────────────────────────────
  public shared func addProduct(password : Text, product : Product) : async Bool {
    if (password != ADMIN_PW) { return false };
    let id = nextId;
    products.add(id, { product with id });
    nextId += 1;
    true
  };

  public shared func updateProduct(password : Text, id : Nat, product : Product) : async Bool {
    if (password != ADMIN_PW) { return false };
    switch (products.get(id)) {
      case (null) { false };
      case (_) {
        products.add(id, { product with id });
        true
      };
    }
  };

  public shared func deleteProduct(password : Text, id : Nat) : async Bool {
    if (password != ADMIN_PW) { return false };
    if (products.containsKey(id)) {
      products.remove(id);
      stockMap.remove(id);
      true
    } else {
      false
    }
  };

  public query func getProducts() : async [Product] {
    products.values().toArray()
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id)
  };

  // ── Stock ─────────────────────────────────────────────────────────────────
  public shared func setProductStock(password : Text, id : Nat, quantity : Nat) : async Bool {
    if (password != ADMIN_PW) { return false };
    stockMap.add(id, quantity);
    true
  };

  public query func getProductStock(id : Nat) : async Nat {
    switch (stockMap.get(id)) {
      case (?qty) { qty };
      case (null) { 0 };
    }
  };

  public query func getAllStock() : async [(Nat, Nat)] {
    stockMap.entries().toArray()
  };

  // ── Enquiries ─────────────────────────────────────────────────────────────
  public shared func submitEnquiry(name : Text, phone : Text, message : Text) : async Nat {
    let id = nextEnquiryId;
    let e : Enquiry = { id; name; phone; message; createdAt = Time.now() };
    enquiries.add(id, e);
    nextEnquiryId += 1;
    id
  };

  public shared func getEnquiries(password : Text) : async [Enquiry] {
    if (password != ADMIN_PW) { return [] };
    enquiries.values().toArray()
  };

  public shared func deleteEnquiry(password : Text, id : Nat) : async Bool {
    if (password != ADMIN_PW) { return false };
    if (enquiries.containsKey(id)) {
      enquiries.remove(id);
      true
    } else {
      false
    }
  };

  // ── Seed ──────────────────────────────────────────────────────────────────
  public shared func seedProducts(password : Text) : async Bool {
    if (password != ADMIN_PW) { return false };
    if (products.size() > 0) { return false };
    let seed : [(Nat, Product)] = [
      (1, { id = 1; name = "Halonix Ceiling Fan"; brand = "Halonix"; category = "Fans"; price = 1800; badge = "Bestseller"; description = "Energy efficient ceiling fan."; imageUrl = "" }),
      (2, { id = 2; name = "Voltas Pedestal Fan"; brand = "Voltas"; category = "Fans"; price = 2200; badge = "New Arrival"; description = "Silent pedestal fan."; imageUrl = "" }),
      (3, { id = 3; name = "Voltas Instant Geyser"; brand = "Voltas"; category = "Geysers"; price = 3500; badge = "Bestseller"; description = "Instant water heater."; imageUrl = "" }),
      (4, { id = 4; name = "Voltas Storage Geyser 25L"; brand = "Voltas"; category = "Geysers"; price = 4999; badge = "Large Size"; description = "High-capacity water heater."; imageUrl = "" }),
      (5, { id = 5; name = "Voltas Desert Cooler"; brand = "Voltas"; category = "Coolers"; price = 6500; badge = "Bestseller"; description = "Desert air cooler."; imageUrl = "" }),
      (6, { id = 6; name = "Pigeon Personal Cooler"; brand = "Pigeon"; category = "Coolers"; price = 2800; badge = "New Arrival"; description = "Compact personal cooler."; imageUrl = "" }),
      (7, { id = 7; name = "Halonix LED Bulb 9W"; brand = "Halonix"; category = "Lights"; price = 120; badge = "Bestseller"; description = "Energy saving LED bulb."; imageUrl = "" }),
      (8, { id = 8; name = "Halonix Panel Light"; brand = "Halonix"; category = "Lights"; price = 599; badge = "Sale"; description = "LED panel light."; imageUrl = "" }),
      (9, { id = 9; name = "Pigeon Mixer Grinder"; brand = "Pigeon"; category = "Home Appliances"; price = 2200; badge = "Bestseller"; description = "3 jar mixer grinder."; imageUrl = "" }),
      (10, { id = 10; name = "Varmora Storage Container Set"; brand = "Varmora"; category = "Varmora Plastic Items"; price = 950; badge = "Kitchen Essential"; description = "Airtight plastic containers."; imageUrl = "" }),
      (11, { id = 11; name = "Varmora Water Jug"; brand = "Varmora"; category = "Varmora Plastic Items"; price = 350; badge = "Summer Special"; description = "Leak proof water jug."; imageUrl = "" })
    ];
    for ((k, v) in seed.vals()) { products.add(k, v) };
    nextId := 12;
    true
  };
};
