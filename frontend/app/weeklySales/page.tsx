"use client";
import { useGetWeeklySalesListQuery } from "@/redux/api/WeeklySalesApi";
import React from "react";

const WeeklySales = () => {
  const {
    data: WeeklySalesList,
    isLoading: WeeklySalesLoading,
    isError: WeeklySalesError,
  } = useGetWeeklySalesListQuery("");

//   const {data: }

  return <div></div>;
};

export default WeeklySales;
