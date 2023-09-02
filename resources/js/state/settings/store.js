import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/settings/stores`;

const initialState = {
    isLoading: true,
};

export const getStore = createAsyncThunk(
    'getStore',
    async (storeId, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            const response = await axios.get(`${END_POINT}/${storeId}?token=${token}`);
            const { data: store } = response.data;

            return {
                isLoading: false,
                store,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const storeSlice = createSlice({
    name: 'store',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getStore.pending, (state) => {
            return {
                ...state,
                isLoading: true,
            }
        });
        builder.addCase(getStore.fulfilled, (state, action) => {
            const {
                isLoading,
                store,
            } = action.payload;

            return {
                ...state,
                ...store,
                isLoading,
            };
        });
        builder.addCase(getStore.rejected, (state) => {
            return {
                ...state,
                isLoading: false,
            }
        });
    },
});

export default storeSlice.reducer;
