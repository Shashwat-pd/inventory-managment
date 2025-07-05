import { BasicResponse } from "@/types/types";
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  { baseUrl?: string }
> = async (args, api, extraOptions) => {
  const baseUrl = extraOptions?.baseUrl || `/external`;
  const baseQuery = fetchBaseQuery({ baseUrl });

  const fetchArgs: FetchArgs =
    typeof args === "string" ? { url: args } : { ...args };


    return baseQuery(fetchArgs, api, extraOptions);
};


export const errorMessage = (error: any) : string =>{
  if(
    error && 
    typeof error ==='object' &&
    error !==null &&
    'data' in error &&
    error.data&&
    typeof error.data === 'object' &&
    'Message' in error.data
  ){
    return (error.data as BasicResponse).Message || 'Something went wrong';

  }
  return "Something went wrong"
}