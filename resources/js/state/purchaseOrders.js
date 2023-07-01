import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/purchase-orders`;

const initialState = {
    errorMessage: '',
    errors: [],
    isLoading: true,
};

export const deletePurchaseOrder = createAsyncThunk(
    'delete-purchase-order',
    async ({ purchaseOrderId } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.delete(`${END_POINT}/${purchaseOrderId}?token=${token}`);
            return {
                isLoading: false,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const storePurchaseOrder = createAsyncThunk(
    'store-purchase-order',
    async ({ postData } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.post(`${END_POINT}?token=${token}`, postData);
            return {
                isLoading: false,
            };
        } catch (error) {
            const { message: errorMessage, errors } = error.response.data;
            return rejectWithValue({ errorMessage, errors });
        }
    },
);

export const purchaseOrdersSlice = createSlice({
    name: 'purchase-orders',
    initialState,
    reducers: { },
    extraReducers: (builder) => {
        // delete purchase order
        builder.addCase(deletePurchaseOrder.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(deletePurchaseOrder.fulfilled, (state, action) => {
            const {
                isLoading,
            } = action.payload;
            return {
                ...state,
                isLoading,
            };
        });
        builder.addCase(deletePurchaseOrder.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // store purchase order
        builder.addCase(storePurchaseOrder.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(storePurchaseOrder.fulfilled, (state, action) => {
            const {
                isLoading,
            } = action.payload;
            return {
                ...state,
                isLoading,
            };
        });
        builder.addCase(storePurchaseOrder.rejected, (state, action) => {
            const { errorMessage, errors } = action.payload;
            return {
                ...state,
                errorMessage,
                errors,
                isLoading: false,
            }
        });
    },
});

export default purchaseOrdersSlice.reducer;
