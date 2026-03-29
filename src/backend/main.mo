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

  // Stable storage — survives every redeploy
  stable var stableProducts : [(Nat, Product)] = [];
  stable var nextId : Nat = 1;
  stable var stableEnquiries : [(Nat, Enquiry)] = [];
  stable var nextEnquiryId : Nat = 1;

  // In-memory maps rebuilt from stable storage on startup
  var products : Map.Map<Nat, Product> = Map.empty<Nat, Product>();
  var enquiries : Map.Map<Nat, Enquiry> = Map.empty<Nat, Enquiry>();

  // Save to stable before upgrade
  system func preupgrade() {
    stableProducts := products.entries().toArray();
    stableEnquiries := enquiries.entries().toArray();
  };

  // Restore from stable after upgrade
  system func postupgrade() {
    for ((k, v) in stableProducts.vals()) {
      products.add(k, v);
    };
    stableProducts := [];
    for ((k, v) in stableEnquiries.vals()) {
      enquiries.add(k, v);
    };
    stableEnquiries := [];
  };

  public shared ({ caller }) func checkAdminPassword(password : Text) : async Bool {
    password == "vaibhav@2210";
  };

  public shared ({ caller }) func addProduct(password : Text, product : Product) : async Bool {
    if (password != "vaibhav@2210") return false;
    products.add(nextId, { product with id = nextId });
    nextId += 1;
    true;
  };

  public shared ({ caller }) func updateProduct(password : Text, id : Nat, product : Product) : async Bool {
    if (password != "vaibhav@2210") return false;
    switch (products.get(id)) {
      case (null) { false };
      case (_) {
        products.add(id, { product with id });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(password : Text, id : Nat) : async Bool {
    if (password != "vaibhav@2210") return false;
    if (products.containsKey(id)) {
      products.remove(id);
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

  // ── Enquiries ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func submitEnquiry(name : Text, phone : Text, message : Text) : async Nat {
    let id = nextEnquiryId;
    enquiries.add(id, { id; name; phone; message; createdAt = 0 });
    nextEnquiryId += 1;
    id;
  };

  public shared ({ caller }) func getEnquiries(password : Text) : async [Enquiry] {
    if (password != "vaibhav@2210") return [];
    enquiries.values().toArray();
  };

  public shared ({ caller }) func deleteEnquiry(password : Text, id : Nat) : async Bool {
    if (password != "vaibhav@2210") return false;
    if (enquiries.containsKey(id)) {
      enquiries.remove(id);
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func seedProducts(password : Text) : async Bool {
    if (password != "vaibhav@2210") return false;

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
      { name = "Indecool Personal Cooler"; brand = "Indecool"; category = "Coolers"; price = 2800; badge = "New Arrival"; description = "Compact personal cooler."; imageUrl = "" },
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
    true;
  };
};
