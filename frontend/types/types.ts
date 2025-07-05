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
