import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  type ProductOld = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    price : Nat;
    badge : Text;
    description : Text;
    imageUrl : Text;
  };

  type ProductNew = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    price : Nat;
    badge : Text;
    description : Text;
    imageUrl : Text;
    image : Text;
  };

  type StockEntry = {
    productId : Nat;
    quantity : Nat;
  };

  type Enquiry = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    createdAt : Int;
  };

  type OldActor = {
    products : [ProductOld];
    stockEntries : [StockEntry];
    enquiries : [Enquiry];
    nextId : Nat;
    nextEnquiryId : Nat;
  };

  type NewActor = {
    products : [ProductNew];
    stockEntries : [StockEntry];
    enquiries : [Enquiry];
    nextId : Nat;
    nextEnquiryId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map(
      func(p) {
        {
          id = p.id;
          name = p.name;
          brand = p.brand;
          category = p.category;
          price = p.price;
          badge = p.badge;
          description = p.description;
          imageUrl = p.imageUrl;
          image = p.imageUrl;
        };
      }
    );
    {
      products = newProducts;
      stockEntries = old.stockEntries;
      enquiries = old.enquiries;
      nextId = old.nextId;
      nextEnquiryId = old.nextEnquiryId;
    };
  };
};
