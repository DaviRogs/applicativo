import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

import { clearPatientFound } from './patientSlice';
import { resetarQuestionario } from './anamnesisSlice';
import { resetConsentForm } from './consentTermSlice';
import { resetFormAll } from './injurySlice';

export const resetAllStates = () => (dispatch) => {
  dispatch(clearSubmissionData());
  dispatch(clearPatientFound());
  dispatch(resetarQuestionario());
  dispatch(resetConsentForm());
  dispatch(resetFormAll());
};

const convertToBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (lowered === 'sim' || lowered === 'yes' || lowered === 'true')
      return true;
    if (
      lowered === 'não' ||
      lowered === 'nao' ||
      lowered === 'no' ||
      lowered === 'false'
    )
      return false;
  }
  return false;
};

const fototipoMapping = {
  // Cor da pele
  'branca leitosa': 0,
  branca: 2,
  'branca a bege, com base dourada': 4,
  bege: 8,
  'castanha clara': 12,
  'castanha escura': 16,
  negra: 20,

  // Cor dos olhos
  'azul claro, cinza, verde': 0,
  'azul, cinza ou verde': 1,
  azul: 2,
  'castanho claro': 3,
  'castanho escuro': 4,

  // Cor do cabelo
  'ruivo, loiro claro': 0,
  'loiro, castanho claro': 1,
  castanho: 2,
  'castanho escura': 3,
  preto: 4,

  // Sardas
  muitas: 0,
  algumas: 1,
  poucas: 2,
  nenhuma: 3,

  // Reação ao sol
  'fica vermelha, dolorida, descasca': 0,
  'fica vermelha, descasca um pouco': 2,
  'fica vermelha, mas não descasca': 4,
  'fica levemente ou nada vermelha': 6,
  'nunca fica vermelha': 8,

  // Bronzeamento
  'nunca, sempre queima': 0,
  'às vezes': 2,
  frequentemente: 4,
  sempre: 6,

  // Sensibilidade da face
  'muito sensível': 0,
  sensível: 1,
  normal: 2,
  resistente: 3,
  'muito resistente, nunca queima': 4,
};

const convertToNumber = (value, defaultValue = 1) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    for (const [key, mappedValue] of Object.entries(fototipoMapping)) {
      if (lowered.includes(key)) return mappedValue;
    }
    const num = parseInt(value);
    if (!isNaN(num)) return num;
  }
  return defaultValue;
};

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

      if (
        !anamnesis.progressoQuestionario?.concluido &&
        anamnesis.progressoQuestionario?.etapaAtual <
          anamnesis.progressoQuestionario?.totalEtapas
      ) {
        return rejectWithValue('Anamnesis form must be completed');
      }

      if (!patient.patientData || !patient.patientData.id) {
        return rejectWithValue('Patient data is required');
      }

      // Step 1: Register attendance
      let attendanceResponse;
      try {
        console.log(
          `Starting patient data submission for patient ID: ${patient.patientData.id}`,
        );
        attendanceResponse = await apiService.registerAttendance(
          patient.patientData.id,
          auth.accessToken,
        );
        console.log('Attendance registered successfully:', attendanceResponse);
      } catch (attendanceError) {
        console.error('Error registering attendance:', attendanceError);
        return rejectWithValue(
          `Failed to register attendance: ${attendanceError.message}`,
        );
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
          auth.accessToken,
        );
        console.log('Consent term uploaded successfully:', consentResponse);
      } catch (consentError) {
        console.error('Error uploading consent term:', consentError);
        return rejectWithValue(
          `Failed to upload consent term: ${consentError.message}`,
        );
      }

      // Step 3: Submit
      try {
        console.log('Preparing anamnesis data for submission...');
        const anamnesisData = {
          saude_geral: {
            doencas_cronicas: convertToBoolean(
              anamnesis.questoesGerais?.listaDoencasCronicas?.doencasCronicas,
            ),
            hipertenso: convertToBoolean(
              anamnesis.questoesGerais?.listaDoencasCronicas?.hipertenso,
            ),
            diabetes: convertToBoolean(
              anamnesis.questoesGerais?.listaDoencasCronicas?.diabetes,
            ),
            cardiopatia: convertToBoolean(
              anamnesis.questoesGerais?.listaDoencasCronicas?.cardiopatia,
            ),
            outras_doencas:
              anamnesis.questoesGerais?.listaDoencasCronicas?.outrasTexto || '',
            diagnostico_cancer: convertToBoolean(
              anamnesis.questoesGerais?.diagnosticoCancer,
            ),
            tipo_cancer: anamnesis.questoesGerais?.tipoCancer || '',
            uso_medicamentos: convertToBoolean(
              anamnesis.questoesGerais?.usoMedicamentos,
            ),
            medicamentos: anamnesis.questoesGerais?.medicamentos || '',
            possui_alergia: convertToBoolean(
              anamnesis.questoesGerais?.possuiAlergia,
            ),
            alergias: anamnesis.questoesGerais?.alergias || '',
            ciruturgias_dermatologicas: convertToBoolean(
              anamnesis.questoesGerais?.ciruturgiasDermatologicas,
            ),
            tipo_procedimento: anamnesis.questoesGerais?.tipoProcedimento || '',
            pratica_atividade_fisica: convertToBoolean(
              anamnesis.questoesGerais?.praticaAtividadeFisica,
            ),
            frequencia_atividade_fisica:
              anamnesis.questoesGerais?.frequenciaAtividadeFisica || 'Diária',
          },
          avaliacao_fototipo: {
            cor_pele: convertToNumber(anamnesis.avaliacaoFototipo?.corPele, 1),
            cor_olhos: convertToNumber(
              anamnesis.avaliacaoFototipo?.corOlhos,
              1,
            ),
            cor_cabelo: convertToNumber(
              anamnesis.avaliacaoFototipo?.corCabelo,
              1,
            ),
            quantidade_sardas: convertToNumber(
              anamnesis.avaliacaoFototipo?.quantidadeSardas,
              1,
            ),
            reacao_sol: convertToNumber(
              anamnesis.avaliacaoFototipo?.reacaoSol,
              1,
            ),
            bronzeamento: convertToNumber(
              anamnesis.avaliacaoFototipo?.bronzeamento,
              1,
            ),
            sensibilidade_solar: convertToNumber(
              anamnesis.avaliacaoFototipo?.sensibilidadeSolar,
              1,
            ),
          },
          historico_cancer_pele: {
            historico_familiar: convertToBoolean(
              anamnesis.historicoCancer?.historicoFamiliar,
            ),
            grau_parentesco: anamnesis.historicoCancer?.grauParentesco || 'Pai',
            tipo_cancer_familiar:
              anamnesis.historicoCancer?.tipoCancerFamiliar || 'Melanoma',
            tipo_cancer_familiar_outro:
              anamnesis.historicoCancer?.tipoCancerFamiliarOutro || '',
            diagnostico_pessoal:
              convertToBoolean(anamnesis.historicoCancer?.diagnosticoPessoal) ||
              false,
            tipo_cancer_pessoal:
              anamnesis.historicoCancer?.tipoCancerPessoal || 'Melanoma',
            tipo_cancer_pessoal_outro:
              anamnesis.historicoCancer?.tipoCancerPessoalOutro || '',
            lesoes_precancerigenas:
              convertToBoolean(
                anamnesis.historicoCancer?.lesoesPrecancerigenas,
              ) || false,
            tratamento_lesoes:
              convertToBoolean(anamnesis.historicoCancer?.tratamentoLesoes) ||
              false,
            tipo_tratamento:
              anamnesis.historicoCancer?.tipoTratamento || 'Cirurgia',
            tipo_tratamento_outro:
              anamnesis.historicoCancer?.tipoTratamentoOutro || '',
          },
          fatores_risco_protecao: {
            exposicao_solar_prolongada: convertToBoolean(
              anamnesis.fatoresRisco?.exposicaoSolarProlongada,
            ),
            frequencia_exposicao_solar:
              anamnesis.fatoresRisco?.frequenciaExposicaoSolar || 'Diariamente',
            queimaduras_graves:
              convertToBoolean(anamnesis.fatoresRisco?.queimadurasGraves) ||
              false,
            quantidade_queimaduras:
              anamnesis.fatoresRisco?.quantidadeQueimaduras || '1-2',
            uso_protetor_solar:
              convertToBoolean(anamnesis.fatoresRisco?.usoProtetorSolar) ||
              false,
            fator_protecao_solar:
              anamnesis.fatoresRisco?.fatorProtecaoSolar || '15',
            uso_chapeu_roupa_protecao:
              convertToBoolean(
                anamnesis.fatoresRisco?.usoChapeuRoupaProtecao,
              ) || false,
            bronzeamento_artificial:
              convertToBoolean(
                anamnesis.fatoresRisco?.bronzeamentoArtificial,
              ) || false,
            checkups_dermatologicos:
              convertToBoolean(
                anamnesis.fatoresRisco?.checkupsDermatologicos,
              ) || false,
            frequencia_checkups:
              anamnesis.fatoresRisco?.frequenciaCheckups || 'Anualmente',
            frequencia_checkups_outro:
              anamnesis.fatoresRisco?.frequenciaCheckupsOutro || '',
            participacao_campanhas_prevencao:
              convertToBoolean(
                anamnesis.fatoresRisco?.participacaoCampanhasPrevencao,
              ) || false,
          },
          investigacao_lesoes_suspeitas: {
            mudanca_pintas_manchas: convertToBoolean(
              anamnesis.investigacaoLesoes?.mudancaPintasManchas,
            ),
            sintomas_lesoes:
              convertToBoolean(anamnesis.investigacaoLesoes?.sintomasLesoes) ||
              false,
            tempo_alteracoes:
              anamnesis.investigacaoLesoes?.tempoAlteracoes || 'Menos de 1 mês',
            caracteristicas_lesoes:
              convertToBoolean(
                anamnesis.investigacaoLesoes?.caracteristicasLesoes,
              ) || false,
            consulta_medica:
              convertToBoolean(anamnesis.investigacaoLesoes?.consultaMedica) ||
              false,
            diagnostico_lesoes:
              anamnesis.investigacaoLesoes?.diagnosticoLesoes || '',
          },
        };
        console.log('Anamnesis data:', anamnesisData);
        const anamnesisResponse = await apiService.submitAnamnesisData(
          attendanceId,
          anamnesisData,
          auth.accessToken,
        );
        console.log(
          'Anamnesis data submitted successfully:',
          anamnesisResponse,
        );
      } catch (anamnesisError) {
        console.error('Error submitting anamnesis data:', anamnesisError);
        return rejectWithValue(
          `Failed to submit anamnesis data: ${anamnesisError.message}`,
        );
      }

      // Step 4:
      const injuriesData = injury?.injuries || [];
      const lesoesRegistradas = [];

      if (injuriesData.length > 0) {
        try {
          console.log(`Processing ${injuriesData.length} injuries...`);
          for (let index = 0; index < injuriesData.length; index++) {
            const injuryItem = injuriesData[index];
            const lesionId = index + 1;

            console.log(`Registering injury number: ${lesionId}`);
            const resultLesao = await apiService.registerLesion(
              attendanceId,
              {
                location: injuryItem.id || injuryItem.location,
                description: injuryItem.description || '',
              },
              injuryItem.photos || [],
              auth.accessToken,
            );

            console.log('Injury registration result:', resultLesao);

            localStorage.setItem(
              `injuryResult-${lesionId}`,
              JSON.stringify({
                ...resultLesao,
                lesionId,
                description: injuryItem.description || '',
              }),
            );

            lesoesRegistradas.push({
              ...resultLesao,
              lesionId,
              description: injuryItem.description || '',
            });
          }
        } catch (injuryError) {
          console.error('Error registering injuries:', injuryError);
          console.warn(
            'Continuing submission despite injury registration error',
          );
        }
      }

      // Store submission timestamp
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem('lastSubmission', timestamp);
      console.log('Patient data submission completed successfully');

      return {
        success: true,
        timestamp,
        attendanceId,
        lesoesRegistradas,
      };
    } catch (error) {
      console.error('Unhandled error in submitPatientData:', error);
      return rejectWithValue(
        error.message || 'An unexpected error occurred during submission',
      );
    }
  },
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
    anamnesis: null,
  },
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
        anamnesis: null,
      };

      // Validate auth state
      if (!auth.isAuthenticated) {
        state.validationErrors.auth = 'User must be authenticated';
        state.isReadyForSubmission = false;
        return;
      }

      // Validate consent term
      if (!consentTerm.signaturePhoto || !consentTerm.isConsentAgreed) {
        state.validationErrors.consentTerm =
          'Consent term must be completed with signature';
        state.isReadyForSubmission = false;
        return;
      }

      // Validate anamnesis completion
      const isAnamnesisComplete =
        anamnesis.progressoQuestionario?.concluido ||
        anamnesis.progressoQuestionario?.etapaAtual >=
          anamnesis.progressoQuestionario?.totalEtapas;

      if (!isAnamnesisComplete) {
        state.validationErrors.anamnesis =
          'All anamnesis sections must be completed';
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
    },
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
  },
});

export const {
  validateFormCompletion,
  resetSubmissionStatus,
  clearSubmissionData,
} = formSubmissionSlice.actions;

// Selectors
export const selectIsReadyForSubmission = (state) =>
  state.formSubmission.isReadyForSubmission;
export const selectValidationErrors = (state) =>
  state.formSubmission.validationErrors;
export const selectSubmissionStatus = (state) =>
  state.formSubmission.submissionStatus;
export const selectLastSubmission = (state) =>
  state.formSubmission.lastSubmission;
export const selectSubmissionError = (state) => state.formSubmission.error;
export const selectAttendanceId = (state) => state.formSubmission.attendanceId;

export default formSubmissionSlice.reducer;
