
import { baseQueryWithReauth } from "@/lib/utils";
import { IInventoryData } from "@/types";
import { createApi } from "@reduxjs/toolkit/query/react";
export const InventoryApi = createApi({
    reducerPath : "inventroyApi",
     baseQuery: async (args, api, extraOptions) =>
        baseQueryWithReauth(args, api, { ...extraOptions, baseUrl: `/external` }),
     tagTypes : ['inventory'],
     endpoints : (builder) => ({
        getInventory : builder.query<IInventoryData,string>({
         query : () => `/api/inventory`
        }),

})
})


export const { useGetInventoryQuery} = InventoryApi