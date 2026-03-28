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
export interface backendInterface {
    addProduct(password: string, product: Product): Promise<boolean>;
    checkAdminPassword(password: string): Promise<boolean>;
    deleteProduct(password: string, id: bigint): Promise<boolean>;
    getProduct(id: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    seedProducts(password: string): Promise<boolean>;
    updateProduct(password: string, id: bigint, product: Product): Promise<boolean>;
}
