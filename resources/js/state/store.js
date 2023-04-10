import { configureStore } from "@reduxjs/toolkit";
import authenticateReducer from "./authenticate";
import purchaseOrderDetilsReducer from "./purchaseOrderDetails";
import purchaseOrderStoreRequestReducer from "./purchaseOrderStoreRequest";

export const store = configureStore({
    reducer: {
        authenticate: authenticateReducer,
        purchaseOrderDetails: purchaseOrderDetilsReducer,
        purchaseOrderStoreRequest: purchaseOrderStoreRequestReducer,
    },
});
