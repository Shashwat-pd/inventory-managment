import { baseQueryWithReauth } from "@/lib/utils";
import { DepartmentResponse } from "@/types";
import { createApi } from "@reduxjs/toolkit/query/react";

export const DepartmentApi = createApi({
  reducerPath: "departmentApi",
  baseQuery: async (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
  tagTypes: ["department"],
  endpoints: (builder) => ({
    getDepartments: builder.query<DepartmentResponse, string>({
      query: () => `/api/departments/`,
    }),
  
    postDepartments: builder.mutation({
      query: (data) => ({
        url: `/api/departments/`,
        method: "POST",
        body: data,
      }),
    }),

    putDepartments: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/departments/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteDepartments: builder.mutation({
      query: (id) => ({
        url: `/api/departments/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});


export const {
    useGetDepartmentsQuery,
    useDeleteDepartmentsMutation,
    usePostDepartmentsMutation,
    usePutDepartmentsMutation

} = DepartmentApi
