import { baseQueryWithReauth } from "@/lib/utils";
import { StoreResponse } from "@/types";
import { createApi } from "@reduxjs/toolkit/query/react";

export const StoreApi = createApi({
  reducerPath: "storeApi",
  baseQuery: async (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
  tagTypes: ["store"],
  endpoints: (builder) => ({
    getStore: builder.query<StoreResponse, string>({
      query: () => `/api/stores/`,
    }),
    postStore: builder.mutation({
      query: (data) => ({
        url: `/api/stores/`,
        method: "POST",
        body: data,
      }),
    }),
    putStore: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/stores/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteStore: builder.mutation({
      query: (id) => ({
        url: `/api/stores/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});


export const {
useDeleteStoreMutation,
useGetStoreQuery,
usePostStoreMutation,
usePutStoreMutation,
} = StoreApi
