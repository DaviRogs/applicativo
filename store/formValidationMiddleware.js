import { validateFormCompletion } from './formSubmissionSlice';

const formValidationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  const relevantActionTypes = [
    // Anamnesis actions
    'anamnesis/atualizarQuestoesGerais',
    'anamnesis/atualizarAvaliacaoFototipo',
    'anamnesis/atualizarHistoricoCancer',
    'anamnesis/atualizarFatoresRisco',
    'anamnesis/atualizarInvestigacaoLesoes',
    'anamnesis/avancarEtapa',
    'anamnesis/voltarEtapa',
    'anamnesis/resetarQuestionario',

    'auth/login/fulfilled',
    'auth/restoreTokens/fulfilled',
    'auth/logout',

    // ConsentTerm actions
    'consentTerm/setSignaturePhoto',
    'consentTerm/removeSignaturePhoto',
    'consentTerm/setConsentAgreed',
    'consentTerm/resetConsentForm',
  ];

  if (relevantActionTypes.includes(action.type)) {
    const state = store.getState();
    store.dispatch(
      validateFormCompletion({
        anamnesis: state.anamnesis,
        consentTerm: state.consentTerm,
        auth: state.auth,
      }),
    );
  }

  return result;
};

export default formValidationMiddleware;
