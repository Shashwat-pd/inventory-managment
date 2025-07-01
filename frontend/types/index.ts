export interface BasicResponse {
  Code: number;
  Message: string;
}

export interface IInventoryData extends BasicResponse {
  Data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    id: number;
  }[];
}
