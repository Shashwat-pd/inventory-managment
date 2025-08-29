import { baseQueryWithReauth } from "@/lib/utils";
import { ProductResponse } from "@/types";
import { IProduct } from "@/types/types";
import { createApi } from "@reduxjs/toolkit/query/react";

export const ProductApi = createApi({
  reducerPath: "productApi",
  baseQuery: async (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
  tagTypes: ["product"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductResponse, {skip:number,limit:number}>({
      query: ({skip,limit}) => `/api/products/?skip=${skip}&limit=${limit}`,
    }),
    postProduct: builder.mutation({
      query: (data) => ({
        url: `/api/products/`,
        method: "POST",
        body: data,
      }),
    }),
    putProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
    }),
    getProductDetail: builder.query<IProduct, number>({
      query: (id) => `/api/products/${id}`,
    }),
  }),
});

export const {
  useDeleteProductMutation,
  useGetProductsQuery,
  useGetProductDetailQuery,
  usePostProductMutation,
  usePutProductMutation,
} = ProductApi;
