import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/purchase-orders`;

const initialState = {
    errorMessage: '',
    isLoading: true,
    purchaseOrder: null,
    purchaseOrderAssignedStaff: null,
    purchaseOrderExpenses: null,
    purchaseOrderExpensesMeta: null,
    purchaseOrderStores: null,
}

export const fetchPurchaseOrderDetails = createAsyncThunk(
    'purchase-order-details/fetch',
    async ({ purchaseOrderId } = payload) => {
        const token = cookie.load('token');

        const responsePurchaseOrderApi = await axios.get(`${END_POINT}/${purchaseOrderId}?token=${token}`);
        const { data: purchaseOrder } = responsePurchaseOrderApi.data;

        const responsePurchaseOrderAssignedStaffApi = await axios.get(`${END_POINT}/${purchaseOrderId}/assigned-staff?token=${token}`);
        const { data: purchaseOrderAssignedStaff } = responsePurchaseOrderAssignedStaffApi.data;

        const responsePurchaseOrderExpensesApi = await axios.get(`${END_POINT}/${purchaseOrderId}/expenses?token=${token}`);
        const { data: purchaseOrderExpenses, meta: purchaseOrderExpensesMeta } = responsePurchaseOrderExpensesApi.data;

        const responsePurchaseOrderStoresApi = await axios.get(`${END_POINT}/${purchaseOrderId}/stores?include=items&token=${token}`);
        const { data: purchaseOrderStores } = responsePurchaseOrderStoresApi.data;

        return {
            isLoading: false,
            purchaseOrder,
            purchaseOrderAssignedStaff,
            purchaseOrderExpenses,
            purchaseOrderExpensesMeta,
            purchaseOrderStores,
        };
    },
);

export const purchaseOrderDetailsAllocateExpense = createAsyncThunk(
    'purchase-order-details/allocate-expense',
    async ({ purchaseOrderId, serializedData } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.post(`${END_POINT}/${purchaseOrderId}/expenses?token=${token}`, serializedData);
            const responsePurchaseOrderExpensesApi = await axios.get(`${END_POINT}/${purchaseOrderId}/expenses?token=${token}`);
            const { data: purchaseOrderExpenses, meta: purchaseOrderExpensesMeta } = responsePurchaseOrderExpensesApi.data;

            return {
                isLoading: false,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const purchaseOrderDetailsUpdateExpense = createAsyncThunk(
    'purchase-order-details/update-expense',
    async ({ purchaseOrderId, purchaseOrderExpenseId, serializedData } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.patch(`${END_POINT}/${purchaseOrderId}/expenses/${purchaseOrderExpenseId}?token=${token}`, serializedData);
            const responsePurchaseOrderExpensesApi = await axios.get(`${END_POINT}/${purchaseOrderId}/expenses?token=${token}`);
            const { data: purchaseOrderExpenses, meta: purchaseOrderExpensesMeta } = responsePurchaseOrderExpensesApi.data;

            return {
                isLoading: false,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const assignStaffPurchaseOrderDetails = createAsyncThunk(
    'purchase-order-details/assign-staff',
    async ({ purchaseOrderId, serializedData } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.post(`${END_POINT}/${purchaseOrderId}/assigned-staff?token=${token}`, serializedData);
            const responsePurchaseOrderAssignedStaffApi = await axios.get(`${END_POINT}/${purchaseOrderId}/assigned-staff?token=${token}`);
            const { data: purchaseOrderAssignedStaff } = responsePurchaseOrderAssignedStaffApi.data;

            return {
                isLoading: false,
                purchaseOrderAssignedStaff,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const deletePurchaseOrderAssignedStaff = createAsyncThunk(
    'delete-purchase-order-assigned-staff',
    async ({ purchaseOrderId, purchaseOrderAssignedStaffId } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.delete(`${END_POINT}/${purchaseOrderId}/assigned-staff/${purchaseOrderAssignedStaffId}?token=${token}`)
            const responsePurchaseOrderAssignedStaffApi = await axios.get(`${END_POINT}/${purchaseOrderId}/assigned-staff?token=${token}`);
            const { data: purchaseOrderAssignedStaff } = responsePurchaseOrderAssignedStaffApi.data;

            return {
                isLoading: false,
                purchaseOrderAssignedStaff,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const deletePurchaseOrderExpense = createAsyncThunk(
    'delete-purchase-order-expense',
    async ({ purchaseOrderId, purchaseOrderExpenseId } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.delete(`${END_POINT}/${purchaseOrderId}/expenses/${purchaseOrderExpenseId}?token=${token}`)
            const responsePurchaseOrderExpensesApi = await axios.get(`${END_POINT}/${purchaseOrderId}/expenses?token=${token}`);
            const { data: purchaseOrderExpenses, meta: purchaseOrderExpensesMeta } = responsePurchaseOrderExpensesApi.data;

            return {
                isLoading: false,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const deletePurchaseOrderStore = createAsyncThunk(
    'delete-purchase-order-store',
    async ({ purchaseOrderId, storeId } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.delete(`${END_POINT}/${purchaseOrderId}/stores/${storeId}?token=${token}`)
            const responsePurchaseOrderStoresApi = await axios.get(`${END_POINT}/${purchaseOrderId}/stores?include=items&token=${token}`);
            const { data: purchaseOrderStores } = responsePurchaseOrderStoresApi.data;

            return {
                isLoading: false,
                purchaseOrderStores,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const deletePurchaseOrderStoreItem = createAsyncThunk(
    'delete-purchase-order-store-item',
    async ({ purchaseOrderId, storeId, itemId } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.delete(`${END_POINT}/${purchaseOrderId}/stores/${storeId}/items/${itemId}?token=${token}`)
            const responsePurchaseOrderStoresApi = await axios.get(`${END_POINT}/${purchaseOrderId}/stores?include=items&token=${token}`);
            const { data: purchaseOrderStores } = responsePurchaseOrderStoresApi.data;

            return {
                isLoading: false,
                purchaseOrderStores,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const updatePurchaseOrder = createAsyncThunk(
    'update-purchase-order',
    async ({ purchaseOrderId, serializedData } = payload, { rejectWithValue, signal}) => {
        try {
            const source = axios.CancelToken.source();
            signal.addEventListener('abort', () => {
                source.cancel();
            });
            const token = cookie.load('token');
            await axios.patch(`${END_POINT}/${purchaseOrderId}?token=${token}`, serializedData, {
                cancelToken: source.token,
            });
            const responsePurchaseOrderApi = await axios.get(`${END_POINT}/${purchaseOrderId}?token=${token}`, {
                cancelToken: source.token,
            });
            const { data: purchaseOrder } = responsePurchaseOrderApi.data;

            return {
                isLoading: false,
                purchaseOrder,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const updatePurchaseOrderAssignedStaff = createAsyncThunk(
    'update-purchase-order-assigned-staff',
    async ({ purchaseOrderId, purchaseOrderAssignedStaffId, serializedData } = payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            await axios.patch(`${END_POINT}/${purchaseOrderId}/assigned-staff/${purchaseOrderAssignedStaffId}?token=${token}`, serializedData)
            const responsePurchaseOrderAssignedStaffApi = await axios.get(`${END_POINT}/${purchaseOrderId}/assigned-staff?token=${token}`);
            const { data: purchaseOrderAssignedStaff } = responsePurchaseOrderAssignedStaffApi.data;

            return {
                isLoading: false,
                purchaseOrderAssignedStaff,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const updatePurchaseOrderStoreItem = createAsyncThunk(
    'update-purchase-order-store-item',
    async ({ purchaseOrderId, storeId, itemId, postData } = payload, { rejectWithValue, signal }) => {
        try {
            const source = axios.CancelToken.source();
            signal.addEventListener('abort', () => {
                source.cancel();
            });
            const token = cookie.load('token');
            await axios.patch(`${END_POINT}/${purchaseOrderId}/stores/${storeId}/items/${itemId}?token=${token}`, postData, {
                cancelToken: source.token,
            });
            const responsePurchaseOrderStoresApi = await axios.get(`${END_POINT}/${purchaseOrderId}/stores?include=items&token=${token}`, {
                cancelToken: source.token,
            });
            const { data: purchaseOrderStores } = responsePurchaseOrderStoresApi.data;

            return {
                isLoading: false,
                purchaseOrderStores,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const purchaseOrderDetailsSlice = createSlice({
    name: 'purchase-order-details',
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
        builder.addCase(fetchPurchaseOrderDetails.pending, (state) => {
            return {
                ...state,
                isLoading: true,
                purchaseOrder: null,
                purchaseOrderAssignedStaff: null,
                purchaseOrderExpenses: null,
                purchaseOrderExpensesMeta: null,
                purchaseOrderStores: null,
            }
        });
        builder.addCase(fetchPurchaseOrderDetails.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrder,
                purchaseOrderAssignedStaff,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
                purchaseOrderStores,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrder,
                purchaseOrderAssignedStaff,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
                purchaseOrderStores,
            };
        });
        builder.addCase(fetchPurchaseOrderDetails.rejected, (state) => {
            return {
                ...state,
                isLoading: false,
                purchaseOrder: null,
                purchaseOrderAssignedStaff: null,
                purchaseOrderExpenses: null,
                purchaseOrderExpensesMeta: null,
                purchaseOrderStores: null,
            }
        });

        builder.addCase(purchaseOrderDetailsAllocateExpense.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(purchaseOrderDetailsAllocateExpense.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            };
        });
        builder.addCase(purchaseOrderDetailsAllocateExpense.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        builder.addCase(purchaseOrderDetailsUpdateExpense.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(purchaseOrderDetailsUpdateExpense.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            };
        });
        builder.addCase(purchaseOrderDetailsUpdateExpense.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        builder.addCase(assignStaffPurchaseOrderDetails.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(assignStaffPurchaseOrderDetails.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderAssignedStaff,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderAssignedStaff,
            };
        });
        builder.addCase(assignStaffPurchaseOrderDetails.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // delete purchase order - assigned staff
        builder.addCase(deletePurchaseOrderAssignedStaff.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(deletePurchaseOrderAssignedStaff.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderAssignedStaff,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderAssignedStaff,
            };
        });
        builder.addCase(deletePurchaseOrderAssignedStaff.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // delete purchase order - expense
        builder.addCase(deletePurchaseOrderExpense.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(deletePurchaseOrderExpense.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderExpenses,
                purchaseOrderExpensesMeta,
            };
        });
        builder.addCase(deletePurchaseOrderExpense.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // delete purchase order - store
        builder.addCase(deletePurchaseOrderStore.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(deletePurchaseOrderStore.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderStores,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderStores,
            };
        });
        builder.addCase(deletePurchaseOrderStore.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // delete purchase order - store > item
        builder.addCase(deletePurchaseOrderStoreItem.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(deletePurchaseOrderStoreItem.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderStores,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderStores,
            };
        });
        builder.addCase(deletePurchaseOrderStoreItem.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // update purchase order
        builder.addCase(updatePurchaseOrder.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(updatePurchaseOrder.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrder,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrder,
            };
        });
        builder.addCase(updatePurchaseOrder.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // update purchase order - assigned staff
        builder.addCase(updatePurchaseOrderAssignedStaff.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(updatePurchaseOrderAssignedStaff.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderAssignedStaff,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderAssignedStaff,
            };
        });
        builder.addCase(updatePurchaseOrderAssignedStaff.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });

        // update purchase order - store > item
        builder.addCase(updatePurchaseOrderStoreItem.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(updatePurchaseOrderStoreItem.fulfilled, (state, action) => {
            const {
                isLoading,
                purchaseOrderStores,
            } = action.payload;
            return {
                ...state,
                isLoading,
                purchaseOrderStores,
            };
        });
        builder.addCase(updatePurchaseOrderStoreItem.rejected, (state, action) => {
            const { errorMessage } = action.payload;
            return {
                ...state,
                errorMessage,
                isLoading: false,
            }
        });
    },
});

export const { clearErrorMessage } = purchaseOrderDetailsSlice.actions;

export default purchaseOrderDetailsSlice.reducer;
