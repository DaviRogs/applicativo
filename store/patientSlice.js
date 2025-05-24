import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@env';

// Async thunk to check if a patient exists by CPF
export const checkPatientByCpf = createAsyncThunk(
  'patient/checkByCpf',
  async ({ cpf, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/cadastrar-atendimento?cpf_paciente=${cpf}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        return await response.json();
      }

      return null; // No patient found but not an error
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to check patient');
    }
  },
);

// Async thunk to register a new patient
export const registerNewPatient = createAsyncThunk(
  'patient/register',
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/cadastrar-paciente`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || 'Error registering patient',
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to register patient');
    }
  },
);

export const registerAttendance = createAsyncThunk(
  'patient/registerAttendance',
  async ({ patientId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/cadastrar-atendimento?paciente_id=${patientId}`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || 'Error registering attendance',
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to register attendance');
    }
  },
);

const initialState = {
  patientData: null,
  attendanceData: null,
  loading: false,
  checkingCpf: false,
  error: null,
  patientFound: false,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    resetPatientState: (/*state*/) => {
      return initialState;
    },
    clearPatientFound: (state) => {
      state.patientFound = false;
      state.patientData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Patient by CPF
      .addCase(checkPatientByCpf.pending, (state) => {
        state.checkingCpf = true;
        state.error = null;
      })
      .addCase(checkPatientByCpf.fulfilled, (state, action) => {
        state.checkingCpf = false;
        if (action.payload) {
          state.patientData = action.payload;
          state.patientFound = true;
        } else {
          state.patientFound = false;
          state.patientData = null;
        }
      })
      .addCase(checkPatientByCpf.rejected, (state, action) => {
        state.checkingCpf = false;
        state.error = action.payload;
      })

      // Register Patient
      .addCase(registerNewPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerNewPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patientData = action.payload;
        state.patientFound = true;
      })
      .addCase(registerNewPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register Attendance
      .addCase(registerAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceData = action.payload;
      })
      .addCase(registerAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPatientState, clearPatientFound } = patientSlice.actions;

export default patientSlice.reducer;
