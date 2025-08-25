import {
  IDepartment,
  IForeCastSales,
  IInventoryData,
  IProduct,
  IStoreData,
  IWeeklySales,
  StoreInventory,
} from "./types";

export type StoreResponse = IStoreData[];
export type InventoryResponse = IInventoryData[];
export type DepartmentResponse = IDepartment[];
export type ProductResponse = IProduct[];
export type InventoryDepartment = StoreInventory[];
export type WeeklySalesList = IWeeklySales[];
export type SalesForeCast = IForeCastSales[];