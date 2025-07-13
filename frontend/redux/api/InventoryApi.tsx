import { baseQueryWithReauth } from "@/lib/utils";
import { InventoryDepartment } from "@/types";
import { InventoryLevel } from "@/types/types";

import { createApi } from "@reduxjs/toolkit/query/react";
export const InventoryApi = createApi({
  reducerPath: "inventroyApi",
  baseQuery: async (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
  tagTypes: ["inventory"],
  endpoints: (builder) => ({
    getInventory: builder.query<
      InventoryLevel,
      { store_id: number; department_id: number; product_id: number }
    >({
      query: ({ store_id, department_id, product_id }) =>
        `/api/inventory/${store_id}/${department_id}/${product_id}`,
    }),
    getStoreInventory: builder.query<
      InventoryDepartment,
      { store_id: number; department_id: number }
    >({
      query: ({ store_id, department_id }) =>
        `/api/inventory/${store_id}/${department_id}`,
    }),

    putInventory: builder.mutation({
      query: ({ store_id, department_id, product_id, data }) => ({
        url: `/api/inventory/${store_id}/${department_id}/${product_id}`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetInventoryQuery,
  usePutInventoryMutation,
  useGetStoreInventoryQuery,
} = InventoryApi;
