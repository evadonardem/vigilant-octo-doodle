import { configureStore } from "@reduxjs/toolkit";
import authenticateReducer from "./authenticate";
import purchaseOrderDetilsReducer from "./purchaseOrderDetails";
import purchaseOrdersReducer from "./purchaseOrders";
import purchaseOrderStoreRequestReducer from "./purchaseOrderStoreRequest";

export const store = configureStore({
    reducer: {
        authenticate: authenticateReducer,
        purchaseOrderDetails: purchaseOrderDetilsReducer,
        purchaseOrders: purchaseOrdersReducer,
        purchaseOrderStoreRequest: purchaseOrderStoreRequestReducer,
    },
});
