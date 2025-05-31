import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Form state for adding/editing an injury
  formState: {
    location: '',
    description: '',
    photos: [],
    isEditing: false,
    injuryId: null,
  },
  // List of all injuries
  injuries: [],
  // Loading states
  isLoading: false,
  isSaving: false,
};

export const injurySlice = createSlice({
  name: 'injury',
  initialState,
  reducers: {
    // Update single form field
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formState[field] = value;
    },

    // Set entire form state (for editing an existing injury)
    setFormState: (state, action) => {
      state.formState = {
        ...state.formState,
        ...action.payload,
      };
    },

    // Reset form to initial values
    resetForm: (state) => {
      state.formState = {
        location: '',
        description: '',
        photos: [],
        isEditing: false,
        injuryId: null,
      };
    },
    resetFormAll: (state) => {
      state.formState = {
        location: '',
        description: '',
        photos: [],
        isEditing: false,
        injuryId: null,
      };
      state.injuries = [];
    },
    // Add photo to form
    addPhoto: (state, action) => {
      state.formState.photos.push(action.payload);
    },

    // Remove photo from form
    removePhoto: (state, action) => {
      const index = action.payload;
      state.formState.photos.splice(index, 1);
    },

    // Add a new injury to the list
    addInjury: (state, action) => {
      state.injuries.push(action.payload);
    },

    // Update existing injury in the list
    updateInjury: (state, action) => {
      const updatedInjury = action.payload;
      const index = state.injuries.findIndex(
        (injury) => injury.id === updatedInjury.id,
      );
      if (index !== -1) {
        state.injuries[index] = updatedInjury;
      }
    },

    // Delete injury from list
    deleteInjury: (state, action) => {
      const injuryId = action.payload;
      state.injuries = state.injuries.filter(
        (injury) => injury.id !== injuryId,
      );
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set saving state
    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },

    // Set all injuries
    setInjuries: (state, action) => {
      state.injuries = action.payload;
    },
  },
});

export const {
  updateFormField,
  setFormState,
  resetForm,
  resetFormAll,
  addPhoto,
  removePhoto,
  addInjury,
  updateInjury,
  deleteInjury,
  setLoading,
  setSaving,
  setInjuries,
} = injurySlice.actions;

export default injurySlice.reducer;
