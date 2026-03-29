import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
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

  // Stable storage — survives every redeploy AND canister restart
  stable var stableProducts : [(Nat, Product)] = [];
  stable var nextId : Nat = 1;
  stable var stableEnquiries : [(Nat, Enquiry)] = [];
  stable var nextEnquiryId : Nat = 1;
  stable var stableStockMap : [(Nat, Nat)] = [];

  // Helper: build a Map from stable array
  private func buildProductMap() : Map.Map<Nat, Product> {
    let m = Map.empty<Nat, Product>();
    for ((k, v) in stableProducts.vals()) {
      m.add(k, v);
    };
    m
  };

  private func buildEnquiryMap() : Map.Map<Nat, Enquiry> {
    let m = Map.empty<Nat, Enquiry>();
    for ((k, v) in stableEnquiries.vals()) {
      m.add(k, v);
    };
    m
  };

  private func buildStockMap() : Map.Map<Nat, Nat> {
    let m = Map.empty<Nat, Nat>();
    for ((k, v) in stableStockMap.vals()) {
      m.add(k, v);
    };
    m
  };

  // In-memory maps rebuilt from stable storage on upgrade
  var products : Map.Map<Nat, Product> = buildProductMap();
  var enquiries : Map.Map<Nat, Enquiry> = buildEnquiryMap();
  var stockMap : Map.Map<Nat, Nat> = buildStockMap();

  // Keep stable arrays always in sync with in-memory maps
  private func syncStable() {
    stableProducts := products.entries().toArray();
    stableEnquiries := enquiries.entries().toArray();
    stableStockMap := stockMap.entries().toArray();
  };

  // Save to stable before upgrade
  system func preupgrade() {
    syncStable();
  };

  // Restore from stable after upgrade
  system func postupgrade() {
    products := buildProductMap();
    enquiries := buildEnquiryMap();
    stockMap := buildStockMap();
  };

  public shared ({ caller }) func checkAdminPassword(password : Text) : async Bool {
    password == "vaibhav@2210";
  };

  public shared ({ caller }) func addProduct(password : Text, product : Product) : async Bool {
    if (password != "vaibhav@2210") return false;
    let id = nextId;
    products.add(id, { product with id });
    nextId += 1;
    syncStable();
    true;
  };

  public shared ({ caller }) func updateProduct(password : Text, id : Nat, product : Product) : async Bool {
    if (password != "vaibhav@2210") return false;
    switch (products.get(id)) {
      case (null) { false };
      case (_) {
        products.add(id, { product with id });
        syncStable();
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(password : Text, id : Nat) : async Bool {
    if (password != "vaibhav@2210") return false;
    if (products.containsKey(id)) {
      products.remove(id);
      stockMap.remove(id);
      syncStable();
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  // ── Stock ──────────────────────────────────────────────────────────────────

  public shared ({ caller }) func setProductStock(password : Text, id : Nat, quantity : Nat) : async Bool {
    if (password != "vaibhav@2210") return false;
    stockMap.add(id, quantity);
    syncStable();
    true;
  };

  public query ({ caller }) func getProductStock(id : Nat) : async Nat {
    switch (stockMap.get(id)) {
      case (?q) { q };
      case (null) { 0 };
    };
  };

  public query ({ caller }) func getAllStock() : async [(Nat, Nat)] {
    stockMap.entries().toArray();
  };

  // ── Enquiries ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func submitEnquiry(name : Text, phone : Text, message : Text) : async Nat {
    let id = nextEnquiryId;
    enquiries.add(id, { id; name; phone; message; createdAt = 0 });
    nextEnquiryId += 1;
    syncStable();
    id
  };

  public shared ({ caller }) func getEnquiries(password : Text) : async [Enquiry] {
    if (password != "vaibhav@2210") return [];
    enquiries.values().toArray();
  };

  public shared ({ caller }) func deleteEnquiry(password : Text, id : Nat) : async Bool {
    if (password != "vaibhav@2210") return false;
    if (enquiries.containsKey(id)) {
      enquiries.remove(id);
      syncStable();
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func seedProducts(password : Text) : async Bool {
    if (password != "vaibhav@2210") return false;
    // Only seed if no products exist
    if (products.size() > 0) return false;

    type RawProduct = {
      name : Text; brand : Text; category : Text;
      price : Nat; badge : Text; description : Text; imageUrl : Text;
    };

    let initialProducts : [RawProduct] = [
      { name = "Halonix Ceiling Fan"; brand = "Halonix"; category = "Fans"; price = 1800; badge = "Bestseller"; description = "Energy efficient ceiling fan."; imageUrl = "" },
      { name = "Voltas Pedestal Fan"; brand = "Voltas"; category = "Fans"; price = 2200; badge = "New Arrival"; description = "Silent pedestal fan."; imageUrl = "" },
      { name = "Voltas Instant Geyser"; brand = "Voltas"; category = "Geysers"; price = 3500; badge = "Bestseller"; description = "Instant water heater."; imageUrl = "" },
      { name = "Voltas Storage Geyser 25L"; brand = "Voltas"; category = "Geysers"; price = 4999; badge = "Large Size"; description = "High-capacity water heater."; imageUrl = "" },
      { name = "Voltas Desert Cooler"; brand = "Voltas"; category = "Coolers"; price = 6500; badge = "Bestseller"; description = "Desert air cooler."; imageUrl = "" },
      { name = "Pigeon Personal Cooler"; brand = "Pigeon"; category = "Coolers"; price = 2800; badge = "New Arrival"; description = "Compact personal cooler."; imageUrl = "" },
      { name = "Halonix LED Bulb 9W"; brand = "Halonix"; category = "Lights"; price = 120; badge = "Bestseller"; description = "Energy saving LED bulb."; imageUrl = "" },
      { name = "Halonix Panel Light"; brand = "Halonix"; category = "Lights"; price = 599; badge = "Sale"; description = "LED panel light."; imageUrl = "" },
      { name = "Pigeon Mixer Grinder"; brand = "Pigeon"; category = "Home Appliances"; price = 2200; badge = "Bestseller"; description = "3 jar mixer grinder."; imageUrl = "" },
      { name = "Varmora Storage Container Set"; brand = "Varmora"; category = "Varmora Plastic Items"; price = 950; badge = "Kitchen Essential"; description = "Airtight plastic containers."; imageUrl = "" },
      { name = "Varmora Water Jug"; brand = "Varmora"; category = "Varmora Plastic Items"; price = 350; badge = "Summer Special"; description = "Leak proof water jug."; imageUrl = "" },
    ];

    for (raw in initialProducts.vals()) {
      products.add(nextId, { raw with id = nextId });
      nextId += 1;
    };
    syncStable();
    true;
  };
};
