import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
import authSlice from './authSlice';
import userSlice from './userSlice';
import injuryReducer from './injurySlice';
import anamnesisReducer from './anamnesisSlice';



const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    injury: injuryReducer,
    anamnesis: anamnesisReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export default store;