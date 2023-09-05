import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/settings/store-categories`;

const initialState = {
    errorMessage: '',
    errors: [],
    isLoading: true,
    categories: {},
};

export const fetchAllStoreCategories = createAsyncThunk(
    'store-categories/all',
    async (_payload, { rejectWithValue }) => {
        try {
            const token = cookie.load('token');
            const response = await axios.get(`${END_POINT}?token=${token}`);
            const { data: categories } = response.data;

            return {
                isLoading: false,
                categories,
            };
        } catch (error) {
            const { message: errorMessage } = error.response.data;
            return rejectWithValue({ errorMessage });
        }
    },
);

export const storeCategoriesSlice = createSlice({
    name: 'store-categories',
    initialState,
    reducers: { },
    extraReducers: (builder) => {
        builder.addCase(fetchAllStoreCategories.pending, (state) => {
            return {
                ...state,
                isLoading: true,
                storeCategories: {},
            }
        });
        builder.addCase(fetchAllStoreCategories.fulfilled, (state, action) => {
            const {
                isLoading,
                categories,
            } = action.payload;

            return {
                ...state,
                isLoading,
                categories,
            };
        });
        builder.addCase(fetchAllStoreCategories.rejected, (state) => {
            return {
                ...state,
                isLoading: false,
                categories: {},
            }
        });
    },
});

export default storeCategoriesSlice.reducer;
