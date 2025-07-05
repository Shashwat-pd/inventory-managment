import { baseQueryWithReauth } from "@/lib/utils";
import { InventoryResponse } from "@/types";

import { createApi } from "@reduxjs/toolkit/query/react";
export const InventoryApi = createApi({
  reducerPath: "inventroyApi",
  baseQuery: async (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
  tagTypes: ["inventory"],
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryResponse, string>({
      query: () => `/api/inventory`,
    }),
    addInventory: builder.mutation({
      query: (data) => ({
        url: "/api/inventory",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),
    getIndividualInventory: builder.query<InventoryResponse, string>({
      query: (id) => `/api/inventory/${id}`,
    }),
    updateInventory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/inventory${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteInventory: builder.mutation({
      query: (id) => ({
        url: `/api/inventory${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useAddInventoryMutation,
  useGetIndividualInventoryQuery,
  useDeleteInventoryMutation,
  useUpdateInventoryMutation,
} = InventoryApi;
