import { baseQueryWithReauth } from "@/lib/utils";

import { IForeCastSales } from "@/types/types";
import { createApi } from "@reduxjs/toolkit/query/react";

export const ForeCastApi = createApi({
  reducerPath: "foreCastApi",
  baseQuery: async (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
  tagTypes: ["foreCast"],
  endpoints: (builder) => ({
    getForeCast: builder.query<
      IForeCastSales,
      { store_id: number; department_id: number; week_date: string }
    >({
      query: ({ store_id, department_id, week_date }) =>
        `/api/forecasts/${store_id}/${department_id}/${week_date}`,
    }),
  }),
});

export const { useGetForeCastQuery } = ForeCastApi;
