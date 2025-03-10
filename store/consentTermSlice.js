import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  signaturePhoto: null,
  signatureDate: null,
  patientName: '',
  patientId: '',
  isConsentAgreed: false,
  loading: false,
  error: null
};

export const consentTermSlice = createSlice({
  name: 'consentTerm',
  initialState,
  reducers: {
    setSignaturePhoto: (state, action) => {
      state.signaturePhoto = action.payload;
      if (action.payload) {
        state.signatureDate = new Date().toISOString();
      }
    },
    removeSignaturePhoto: (state) => {
      state.signaturePhoto = null;
      state.signatureDate = null;
      state.isConsentAgreed = false;
    },
    setPatientInfo: (state, action) => {
      const { name, id } = action.payload;
      state.patientName = name;
      state.patientId = id;
    },
    setConsentAgreed: (state, action) => {
      state.isConsentAgreed = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetConsentForm: (state) => {
      return initialState;
    }
  }
});

export const {
  setSignaturePhoto,
  removeSignaturePhoto,
  setPatientInfo,
  setConsentAgreed,
  setLoading,
  setError,
  resetConsentForm
} = consentTermSlice.actions;

export default consentTermSlice.reducer;