export interface BasicResponse {
  Code: number;
  Message: string;
}

export interface IInventoryData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  id: number;
}

export interface IStoreData {
  name: string;
  location: string;
  size: string;
  id: number;
}

export interface IDepartment {
  name: string;
  id: number;
}

export interface IProduct {
  id: number;
  name: string;
  price: number;
  department_id: number;
  description: string;
}

export interface StoreInventory {
  store_id: number;
  department_id: number;
  product_id: number;
  stock_level: number;
  last_updated: string;
}

export interface InventoryLevel {
  store_id: number;
  department_id: number;
  product_id: number;
  stock_level: number;
  last_updated: string; // ISO 8601 date-time string
}
