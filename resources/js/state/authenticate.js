import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import cookie from 'react-cookies';

const initialState = {
    brand: '',
    errorMessage: '',
    isLoading: true,
    isLoggedIn: false,
    links: [],
    signedInUser: '',
    token: '',
    user: null,
}

export const authorize = createAsyncThunk(
    'authenticate/authorize',
    async () => {
        const token = cookie.load('token');
        const responseUserApi = await axios.post(`${apiBaseUrl}/me?token=${token}`, {});
        const { data: user } = responseUserApi;

        const requestRoles = await axios.get(`${apiBaseUrl}/user/roles?token=${token}`);
        const { data: roles } = requestRoles.data;
        const requestPermissions = await axios.get(`${apiBaseUrl}/user/permissions?token=${token}`);
        const { data: permissions } = requestPermissions.data;
        const requestNavigationMenu = await axios.get(`${apiBaseUrl}/navigation-menu?token=${token}`);
        const { data: navigationMenu } = requestNavigationMenu.data;
        const { brand, links } = navigationMenu;

        user['roles'] = roles;
        user['permissions'] = permissions;

        return {
            isLoading: false,
            isLoggedIn: true,
            signedInUser: user.name,
            brand,
            links,
            user,
        };
    },
);

export const login = createAsyncThunk(
    'authenticate/login',
    async (payload, { dispatch }) => {
        const { biometricId: biometric_id, password } = payload;
        const responseLoginApi = await axios.post(`${apiBaseUrl}/login`, { biometric_id, password });
        const { token } = responseLoginApi.data;
        cookie.save('token', token);
        dispatch(authorize());
        return {
            token,
            isLoading: true,
        };
    },
);

export const logout = createAsyncThunk(
    'authenticate/logout',
    async () => {
        const token = cookie.load('token');
        await axios.post(`${apiBaseUrl}/logout?token=${token}`);
        cookie.save('token', '');
        return {
            errorMessage: '',
            isLoading: false,
            isLoggedIn: false,
            signedInUser: '',
            token: '',
            user: null,
        };
    },
);

export const authenticateSlice = createSlice({
    name: 'authenticate',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(authorize.pending, (state) => {
            return {
                ...state,
                brand: '',
                errorMessage: '',
                isLoading: true,
                isLoggedIn: false,
                links: [],
                signedInUser: '',
                user: null,
            }
        });
        builder.addCase(authorize.fulfilled, (state, action) => {
            const {
                brand,
                isLoading,
                isLoggedIn,
                links,
                signedInUser,
                user
            } = action.payload;
            return {
                ...state,
                brand,
                isLoading,
                isLoggedIn,
                links,
                signedInUser,
                user,
                errorMessage: '',
            };
        });
        builder.addCase(authorize.rejected, (state) => {
            return {
                ...state,
                brand: '',
                errorMessage: '',
                isLoading: false,
                isLoggedIn: false,
                links: [],
                signedInUser: '',
                user: null,
            }
        });

        builder.addCase(login.pending, (state) => {
            return {
                ...state,
                isLoading: true,
                token: '',
            }
        });
        builder.addCase(login.fulfilled, (state, action) => {
            const { isLoading, token } = action.payload;
            return {
                ...state,
                isLoading,
                token,
            }
        });
        builder.addCase(login.rejected, (state) => {
            return {
                ...state,
                errorMessage: 'Invalid biometric ID and/or password.',
                isLoading: false,
                token: '',
            }
        });

        builder.addCase(logout.pending, (state) => {
            state.errorMessage = '';
            state.isLoading = true;
            state.isLoggedIn = false;
            state.signedInUser = '';
            state.token = '';
            state.user = null;
        });
        builder.addCase(logout.fulfilled, (state, action) => {
            const { errorMessage, isLoading, isLoggedIn, signedInUser, token, user } = action.payload;
            state.errorMessage = errorMessage;
            state.isLoading = isLoading;
            state.isLoggedIn = isLoggedIn;
            state.signedInUser = signedInUser;
            state.token = token;
            state.user = user;
        });
        builder.addCase(logout.rejected, (state) => {
            state.errorMessage = '';
            state.isLoading = false;
            state.isLoggedIn = false;
            state.signedInUser = '';
            state.token = '';
            state.user = null;
        });
    },
});

export default authenticateSlice.reducer;
