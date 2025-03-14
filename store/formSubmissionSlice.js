import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

// This thunk will handle the actual submission of all data
export const submitPatientData = createAsyncThunk(
  'formSubmission/submitPatientData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { anamnesis, consentTerm, auth, patient, injury } = state;

      if (!auth.isAuthenticated || !auth.accessToken) {
        return rejectWithValue('User must be authenticated to submit data');
      }

      if (!consentTerm.isConsentAgreed) {
        return rejectWithValue('Consent must be agreed to');
      }
      
      if (!consentTerm.signaturePhoto) {
        return rejectWithValue('Signature photo is required');
      }

      if (!anamnesis.progressoQuestionario?.concluido && 
          anamnesis.progressoQuestionario?.etapaAtual < anamnesis.progressoQuestionario?.totalEtapas) {
        return rejectWithValue('Anamnesis form must be completed');
      }

      if (!patient.patientData || !patient.patientData.id) {
        return rejectWithValue('Patient data is required');
      }

      // Step 1: Register attendance
      let attendanceResponse;
      try {
        console.log(`Starting patient data submission for patient ID: ${patient.patientData.id}`);
        attendanceResponse = await apiService.registerAttendance(
          patient.patientData.id,
          auth.accessToken
        );
        console.log('Attendance registered successfully:', attendanceResponse);
      } catch (attendanceError) {
        console.error('Error registering attendance:', attendanceError);
        return rejectWithValue(`Failed to register attendance: ${attendanceError.message}`);
      }
      
      const attendanceId = attendanceResponse.id;
      if (!attendanceId) {
        return rejectWithValue('No attendance ID returned from API');
      }
      
      // Step 2: Upload consent term
      try {
        console.log('Uploading consent term with signature...');
        const consentResponse = await apiService.uploadConsentTerm(
          attendanceId,
          consentTerm.signaturePhoto,
          auth.accessToken
        );
        console.log('Consent term uploaded successfully:', consentResponse);
      } catch (consentError) {
        console.error('Error uploading consent term:', consentError);
        return rejectWithValue(`Failed to upload consent term: ${consentError.message}`);
      }
      
      // Step 3: Submit 
      try {
        console.log('Preparing anamnesis data for submission...');
        const anamnesisData = {
          saude_geral: {
            doencas_cronicas: anamnesis.questoesGerais?.doencasCronicas || false,
            hipertenso: anamnesis.questoesGerais?.hipertenso || false,
            diabetes: anamnesis.questoesGerais?.diabetes || false,
            cardiopatia: anamnesis.questoesGerais?.cardiopatia || false,
            outras_doencas: anamnesis.questoesGerais?.outrasDoencas || '',
            diagnostico_cancer: anamnesis.questoesGerais?.diagnosticoCancer || false,
            tipo_cancer: anamnesis.questoesGerais?.tipoCancer || '',
            uso_medicamentos: anamnesis.questoesGerais?.usoMedicamentos || false,
            medicamentos: anamnesis.questoesGerais?.medicamentos || '',
            possui_alergia: anamnesis.questoesGerais?.possuiAlergia || false,
            alergias: anamnesis.questoesGerais?.alergias || '',
            ciruturgias_dermatologicas: anamnesis.questoesGerais?.ciruturgiasDermatologicas || false,
            tipo_procedimento: anamnesis.questoesGerais?.tipoProcedimento || '',
            pratica_atividade_fisica: anamnesis.questoesGerais?.praticaAtividadeFisica || false,
            frequencia_atividade_fisica: anamnesis.questoesGerais?.frequenciaAtividadeFisica || 'Diária'
          },
          avaliacao_fototipo: {
            cor_pele: anamnesis.avaliacaoFototipo?.corPele || 0,
            cor_olhos: anamnesis.avaliacaoFototipo?.corOlhos || 0,
            cor_cabelo: anamnesis.avaliacaoFototipo?.corCabelo || 0,
            quantidade_sardas: anamnesis.avaliacaoFototipo?.quantidadeSardas || 0,
            reacao_sol: anamnesis.avaliacaoFototipo?.reacaoSol || 0,
            bronzeamento: anamnesis.avaliacaoFototipo?.bronzeamento || 0,
            sensibilidade_solar: anamnesis.avaliacaoFototipo?.sensibilidadeSolar || 0
          },
          historico_cancer_pele: {
            historico_familiar: anamnesis.historicoCancer?.historicoFamiliar || false,
            grau_parentesco: anamnesis.historicoCancer?.grauParentesco || "Pai",
            tipo_cancer_familiar: anamnesis.historicoCancer?.tipoCancerFamiliar || "Melanoma",
            tipo_cancer_familiar_outro: anamnesis.historicoCancer?.tipoCancerFamiliarOutro || "",
            diagnostico_pessoal: anamnesis.historicoCancer?.diagnosticoPessoal || false,
            tipo_cancer_pessoal: anamnesis.historicoCancer?.tipoCancerPessoal || "Melanoma",
            tipo_cancer_pessoal_outro: anamnesis.historicoCancer?.tipoCancerPessoalOutro || "",
            lesoes_precancerigenas: anamnesis.historicoCancer?.lesoesPrecancerigenas || false,
            tratamento_lesoes: anamnesis.historicoCancer?.tratamentoLesoes || false,
            tipo_tratamento: anamnesis.historicoCancer?.tipoTratamento || "Cirurgia",
            tipo_tratamento_outro: anamnesis.historicoCancer?.tipoTratamentoOutro || ""
          },
          fatores_risco_protecao: {
            exposicao_solar_prolongada: anamnesis.fatoresRisco?.exposicaoSolarProlongada || false,
            frequencia_exposicao_solar: anamnesis.fatoresRisco?.frequenciaExposicaoSolar || "Diariamente",
            queimaduras_graves: anamnesis.fatoresRisco?.queimadurasGraves || false,
            quantidade_queimaduras: anamnesis.fatoresRisco?.quantidadeQueimaduras || "1-2",
            uso_protetor_solar: anamnesis.fatoresRisco?.usoProtetorSolar || false,
            fator_protecao_solar: anamnesis.fatoresRisco?.fatorProtecaoSolar || "15",
            uso_chapeu_roupa_protecao: anamnesis.fatoresRisco?.usoChapeuRoupaProtecao || false,
            bronzeamento_artificial: anamnesis.fatoresRisco?.bronzeamentoArtificial || false,
            checkups_dermatologicos: anamnesis.fatoresRisco?.checkupsDermatologicos || false,
            frequencia_checkups: anamnesis.fatoresRisco?.frequenciaCheckups || "Anualmente",
            frequencia_checkups_outro: anamnesis.fatoresRisco?.frequenciaCheckupsOutro || "",
            participacao_campanhas_prevencao: anamnesis.fatoresRisco?.participacaoCampanhasPrevencao || false
          },
          investigacao_lesoes_suspeitas: {
            mudanca_pintas_manchas: anamnesis.investigacaoLesoes?.mudancaPintasManchas || false,
            sintomas_lesoes: anamnesis.investigacaoLesoes?.sintomasLesoes || false,
            tempo_alteracoes: anamnesis.investigacaoLesoes?.tempoAlteracoes || "Menos de 1 mês",
            caracteristicas_lesoes: anamnesis.investigacaoLesoes?.caracteristicasLesoes || false,
            consulta_medica: anamnesis.investigacaoLesoes?.consultaMedica || false,
            diagnostico_lesoes: anamnesis.investigacaoLesoes?.diagnosticoLesoes || ""
          }
        };
        
        const anamnesisResponse = await apiService.submitAnamnesisData(
          attendanceId,
          anamnesisData,
          auth.accessToken
        );
        console.log('Anamnesis data submitted successfully:', anamnesisResponse);
      } catch (anamnesisError) {
        console.error('Error submitting anamnesis data:', anamnesisError);
        return rejectWithValue(`Failed to submit anamnesis data: ${anamnesisError.message}`);
      }
      
      // Step 4: 
      const injuriesData = injury?.injuries || [];
      if (injuriesData.length > 0) {
        try {
          console.log(`Processing ${injuriesData.length} injuries...`);
          for (const injuryItem of injuriesData) {
            console.log(`Registering injury at location: ${injuryItem.locationId || injuryItem.location}`);
            await apiService.registerLesion(
              attendanceId, 
              {
                location: injuryItem.locationId || injuryItem.location,
                description: injuryItem.description || ''
              },
              injuryItem.photos || [],
              auth.accessToken
            );
          }
          console.log('All injuries registered successfully');
        } catch (injuryError) {
          console.error('Error registering injuries:', injuryError);
          console.warn('Continuing submission despite injury registration error');
        }
      }
      
      // Store submission timestamp
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem('lastSubmission', timestamp);
      console.log('Patient data submission completed successfully');
      
      return { 
        success: true, 
        timestamp,
        attendanceId
      };
    } catch (error) {
      console.error('Unhandled error in submitPatientData:', error);
      return rejectWithValue(error.message || 'An unexpected error occurred during submission');
    }
  }
);

const initialState = {
  isReadyForSubmission: false,
  submissionStatus: 'idle', 
  lastSubmission: null,
  error: null,
  attendanceId: null,
  validationErrors: {
    auth: null,
    consentTerm: null,
    anamnesis: null
  }
};

const formSubmissionSlice = createSlice({
  name: 'formSubmission',
  initialState,
  reducers: {
    validateFormCompletion: (state, action) => {
      const { anamnesis, consentTerm, auth } = action.payload;
      
      // Reset validation errors
      state.validationErrors = {
        auth: null,
        consentTerm: null,
        anamnesis: null
      };
      
      // Validate auth state
      if (!auth.isAuthenticated) {
        state.validationErrors.auth = 'User must be authenticated';
        state.isReadyForSubmission = false;
        return;
      }
      
      // Validate consent term
      if (!consentTerm.signaturePhoto || !consentTerm.isConsentAgreed) {
        state.validationErrors.consentTerm = 'Consent term must be completed with signature';
        state.isReadyForSubmission = false;
        return;
      }
      
      // Validate anamnesis completion
      const isAnamnesisComplete = anamnesis.progressoQuestionario?.concluido || 
        anamnesis.progressoQuestionario?.etapaAtual >= anamnesis.progressoQuestionario?.totalEtapas;
      
      if (!isAnamnesisComplete) {
        state.validationErrors.anamnesis = 'All anamnesis sections must be completed';
        state.isReadyForSubmission = false;
        return;
      }
      
      // If all validations pass
      state.isReadyForSubmission = true;
    },
    
    resetSubmissionStatus: (state) => {
      state.submissionStatus = 'idle';
      state.error = null;
    },
    
    clearSubmissionData: (state) => {
      state.submissionStatus = 'idle';
      state.error = null;
      state.lastSubmission = null;
      state.attendanceId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPatientData.pending, (state) => {
        state.submissionStatus = 'pending';
        state.error = null;
      })
      .addCase(submitPatientData.fulfilled, (state, action) => {
        state.submissionStatus = 'succeeded';
        state.lastSubmission = action.payload.timestamp;
        state.attendanceId = action.payload.attendanceId;
      })
      .addCase(submitPatientData.rejected, (state, action) => {
        state.submissionStatus = 'failed';
        state.error = action.payload || 'Submission failed';
      });
  }
});

export const { 
  validateFormCompletion, 
  resetSubmissionStatus,
  clearSubmissionData
} = formSubmissionSlice.actions;

// Selectors
export const selectIsReadyForSubmission = (state) => state.formSubmission.isReadyForSubmission;
export const selectValidationErrors = (state) => state.formSubmission.validationErrors;
export const selectSubmissionStatus = (state) => state.formSubmission.submissionStatus;
export const selectLastSubmission = (state) => state.formSubmission.lastSubmission;
export const selectSubmissionError = (state) => state.formSubmission.error;
export const selectAttendanceId = (state) => state.formSubmission.attendanceId;

export default formSubmissionSlice.reducer;