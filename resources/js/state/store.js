import { configureStore } from "@reduxjs/toolkit";
import authenticateReducer from "./authenticate";
import purchaseOrderDetilsReducer from "./purchaseOrderDetails";
import purchaseOrdersReducer from "./purchaseOrders";
import purchaseOrderStoreRequestReducer from "./purchaseOrderStoreRequest";
import storeCategoriesReducer from "./storeCategories";
import storeReducer from "./settings/store";

export const store = configureStore({
    reducer: {
        authenticate: authenticateReducer,
        purchaseOrderDetails: purchaseOrderDetilsReducer,
        purchaseOrders: purchaseOrdersReducer,
        purchaseOrderStoreRequest: purchaseOrderStoreRequestReducer,
        storeCategories: storeCategoriesReducer,
        store: storeReducer,
    },
});
