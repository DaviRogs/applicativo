import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
import authSlice from './authSlice';
import userSlice from './userSlice';
import injuryReducer from './injurySlice';
import anamnesisReducer from './anamnesisSlice';
import consentTermReducer from './consentTermSlice';
import formSubmissionReducer from './formSubmissionSlice';
import formValidationMiddleware from './formValidationMiddleware';
import patientSlice from './patientSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    injury: injuryReducer,
    anamnesis: anamnesisReducer,
    consentTerm: consentTermReducer,
    formSubmission: formSubmissionReducer,
    patient: patientSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(formValidationMiddleware),
});

export default store;
