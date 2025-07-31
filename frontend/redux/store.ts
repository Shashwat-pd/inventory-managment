import { configureStore } from "@reduxjs/toolkit";
import { InventoryApi } from "./api/InventoryApi";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { StoreApi } from "./api/StoreApi";
import { DepartmentApi } from "./api/DepartmentsApi";
import { ProductApi } from "./api/ProductApi";
import { WeeklySalesApi } from "./api/WeeklySalesApi";
import { ForeCastApi } from "./api/ForeCastApi";

export const store = configureStore({
  reducer: {
    [InventoryApi.reducerPath]: InventoryApi.reducer,
    [StoreApi.reducerPath]: StoreApi.reducer,
    [DepartmentApi.reducerPath]: DepartmentApi.reducer,
    [ProductApi.reducerPath]: ProductApi.reducer,
    [WeeklySalesApi.reducerPath]: WeeklySalesApi.reducer,
    [ForeCastApi.reducerPath]: ForeCastApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      InventoryApi.middleware,
      StoreApi.middleware,
      DepartmentApi.middleware,
      ProductApi.middleware,
      WeeklySalesApi.middleware,
      ForeCastApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
