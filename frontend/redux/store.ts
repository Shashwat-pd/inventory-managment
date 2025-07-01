import { configureStore } from "@reduxjs/toolkit";
import { InventoryApi } from "./api/InventoryApi";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store  = configureStore({
    reducer :{
        [InventoryApi.reducerPath] : InventoryApi.reducer,
    },
    middleware : (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(
            InventoryApi.middleware,
        )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;      
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
