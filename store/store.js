import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
import authSlice from './authSlice';
import userSlice from './userSlice';


const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export default store;