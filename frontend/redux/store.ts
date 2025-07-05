import { configureStore } from "@reduxjs/toolkit";
import { InventoryApi } from "./api/InventoryApi";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { StoreApi } from "./api/StoreApi";
import { DepartmentApi } from "./api/DepartmentsApi";
import { ProductApi } from "./api/ProductApi";

export const store = configureStore({
  reducer: {
    [InventoryApi.reducerPath]: InventoryApi.reducer,
    [StoreApi.reducerPath]: StoreApi.reducer,
    [DepartmentApi.reducerPath]: DepartmentApi.reducer,
    [ProductApi.reducerPath]: ProductApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      InventoryApi.middleware,
      StoreApi.middleware,
      DepartmentApi.middleware,
      ProductApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
