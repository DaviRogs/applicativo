import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
import authSlice from './authSlice';


const store = configureStore({
  reducer: {
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export default store;