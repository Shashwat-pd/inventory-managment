import { baseQueryWithReauth } from "@/lib/utils";
import { WeeklySalesList } from "@/types";
import { IWeeklySales } from "@/types/types";
import { createApi } from "@reduxjs/toolkit/query/react";

export const WeeklySalesApi = createApi({
  reducerPath: "weeklySalesApi",
  baseQuery: async (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
  tagTypes: ["weeklySales"],
  endpoints: (builder) => ({
    getWeeklySalesList: builder.query<WeeklySalesList, string>({
      query: () => `/api/weekly_sales/`,
    }),
    putWeeklySales: builder.mutation({
      query: ({ store_id, department_id, week_date, data }) => ({
        url: `/api/weekly_sales/${store_id}/${department_id}/${week_date}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["weeklySales"],
    }),
    deleteWeeklySales: builder.mutation({
      query: ({ store_id, department_id, week_date, data }) => ({
        url: `/api/weekly_sales/${store_id}/${department_id}/${week_date}`,
        method: "DELETE",
      }),
      invalidatesTags: ["weeklySales"],
    }),

    getWeeklySales: builder.query<
      IWeeklySales,
      { store_id: string; department_id: number; week_date: string }
    >({
      query: ({ store_id, department_id, week_date }) =>
        `/api/weekly_sales/${store_id}/${department_id}/${week_date}`,
    }),
  }),
});

export const {
  useDeleteWeeklySalesMutation,
  useGetWeeklySalesListQuery,
  useGetWeeklySalesQuery,
  usePutWeeklySalesMutation,
} = WeeklySalesApi;
