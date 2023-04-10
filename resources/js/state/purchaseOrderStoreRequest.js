import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/purchase-orders`;
const END_POINT_SETTINGS = `${apiBaseUrl}/settings`;

const initialState = {
    errorMessage: '',
    isLoading: true,
    purchaseOrder: null,
    store: null,
    storeItems: [],
}

export const fetchPurchaseOrderStoreRequest = createAsyncThunk(
    'fetch-purchase-order-store-request',
    async ({ purchaseOrderId, storeId } = payload) => {
        const token = cookie.load('token');

        const responsePurchaseOrderApi = await axios.get(`${END_POINT}/${purchaseOrderId}?token=${token}`);
        const { data: purchaseOrder } = responsePurchaseOrderApi.data;

        let store = null;
        let storeItems = [];
        if (storeId) {
            const responseStoreRequestApi = await axios.get(`${END_POINT_SETTINGS}/stores/${storeId}?token=${token}`);
            const { data: fetchedStore } = responseStoreRequestApi.data;
            store = fetchedStore;

            const responsePurchaseOrderStoreRequestApi = await axios.get(`${END_POINT}/${purchaseOrderId}/stores/${storeId}/requests?token=${token}`)
            const { data: fetchedStoreItems } = responsePurchaseOrderStoreRequestApi.data;
            storeItems = fetchedStoreItems;
        }

        return {
            isLoading: false,
            purchaseOrder,
            store,
            storeItems,
        };
    },
);

export const updatePurchaseOrderStoreRequest = createAsyncThunk(
    'update-purchase-order-store-request',
    async ({ purchaseOrderId, postData } = payload, { signal }) => {
        const source = axios.CancelToken.source();
        signal.addEventListener('abort', () => {
            source.cancel()
        });

        const token = cookie.load('token');
        const { store_id: storeId } = postData;

        await axios.post(`${END_POINT}/${purchaseOrderId}/items?token=${token}`, postData, {
            cancelToken: source.token,
        });
        const responsePurchaseOrderStoreRequestApi = await axios.get(`${END_POINT}/${purchaseOrderId}/stores/${storeId}/requests?token=${token}`, {
            cancelToken: source.token,
        });
        const { data: storeItems } = responsePurchaseOrderStoreRequestApi.data;

        return {
            isLoading: false,
            storeItems,
        };
    }
);

export const purchaseOrderDetailsSlice = createSlice({
    name: 'purchase-order-store-request',
    initialState,
    reducers: {
        clearErrorMessage: (state) => {
            return {
                ...state,
                errorMessage: '',
            };
        },
    },
    extraReducers: (builder) => {
        // fetch purchase order store request
        builder.addCase(fetchPurchaseOrderStoreRequest.pending, (state) => {
            return {
                ...state,
                isLoading: true,
                storeItems: [],
            }
        });
        builder.addCase(fetchPurchaseOrderStoreRequest.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrder,
                store,
                storeItems,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrder,
                store,
                storeItems,
            };
        });
        builder.addCase(fetchPurchaseOrderStoreRequest.rejected, (state) => {
            return {
                ...state,
                isLoading: false,
                storeItems: [],
            }
        });

        // update purchase order store request
        builder.addCase(updatePurchaseOrderStoreRequest.pending, (state) => {
            return {
                ...state,
                isLoading: false,
            }
        });
        builder.addCase(updatePurchaseOrderStoreRequest.fulfilled, (state, action) => {
            const {
                isLoading,
                storeItems,
            } = action.payload;
            return {
                ...state,
                isLoading,
                storeItems,
            };
        });
        builder.addCase(updatePurchaseOrderStoreRequest.rejected, (state) => {
            return {
                ...state,
                isLoading: false,
            }
        });
    },
});

export const { clearErrorMessage } = purchaseOrderDetailsSlice.actions;

export default purchaseOrderDetailsSlice.reducer;
