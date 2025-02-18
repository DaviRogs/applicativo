import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from './authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  userData: null,
  userRole: null,
  unidadeSaude: null,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { accessToken } = getState().auth;
      
      if (!accessToken) {
        return rejectWithValue('No access token available');
      }

      const response = await fetch('http://localhost:8004/token/get-current-user', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 400) {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        dispatch(logout());
        return rejectWithValue('Token invalid or expired');
      }

      if (!response.ok) {
        return rejectWithValue('Failed to fetch user data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.userData = null;
      state.userRole = null;
      state.unidadeSaude = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.userRole = action.payload.roles[0];
        state.unidadeSaude = action.payload.unidadeSaude;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userData = null;
        state.userRole = null;
        state.unidadeSaude = null;
      })
      .addCase(logout, (state) => {
        state.userData = null;
        state.userRole = null;
        state.unidadeSaude = null;
        state.error = null;
      });
  },
});

export const { clearUserData } = userSlice.actions;

export const selectIsAdmin = (state) => {
  const userRole = state.user?.userRole;
  return userRole?.name === "Admin" || userRole?.nivel_acesso === 3;
};

export const selectIsSupervisor = (state) => {
  const userRole = state.user?.userRole;
  return userRole?.name === "Supervisor" || userRole?.nivel_acesso === 2;
};

export const selectHasAdminAccess = (state) => {
  return selectIsAdmin(state) || selectIsSupervisor(state);
};

export default userSlice.reducer;