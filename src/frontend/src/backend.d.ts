import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    badge: string;
    brand: string;
    price: bigint;
}
export interface Enquiry {
    id: bigint;
    name: string;
    createdAt: bigint;
    message: string;
    phone: string;
}
export interface backendInterface {
    addProduct(password: string, product: Product): Promise<boolean>;
    checkAdminPassword(password: string): Promise<boolean>;
    deleteEnquiry(password: string, id: bigint): Promise<boolean>;
    deleteProduct(password: string, id: bigint): Promise<boolean>;
    getAllStock(): Promise<Array<[bigint, bigint]>>;
    getEnquiries(password: string): Promise<Array<Enquiry>>;
    getProduct(id: bigint): Promise<Product | null>;
    getProductStock(id: bigint): Promise<bigint>;
    getProducts(): Promise<Array<Product>>;
    seedProducts(password: string): Promise<boolean>;
    setProductStock(password: string, id: bigint, quantity: bigint): Promise<boolean>;
    submitEnquiry(name: string, phone: string, message: string): Promise<bigint>;
    updateProduct(password: string, id: bigint, product: Product): Promise<boolean>;
}
