import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Questionário 1: Questões Gerais de Saúde
  questoesGerais: {
    doencasCronicas: '',
    listaDoencasCronicas: {
      hipertensao: false,
      diabetes: false,
      cardiopatia: false,
      outras: false,
      outrasTexto: '',
    },
    cancer: '',
    tipoCancer: '',
    medicamentos: '',
    listaMedicamentos: '',
    alergias: '',
    listaAlergias: '',
    cirurgias: '',
    listaCirurgias: '',
    atividadeFisica: '',
    frequenciaAtividade: '',
  },
  
  // Questionário 2: Avaliação de Fototipo
  avaliacaoFototipo: {
    corPele: '',
    corOlhos: '',
    corCabelo: '',
    sardas: '',
    reacaoSol: '',
    bronzeamento: '',
    sensibilidadeFacial: '',
    pontosTotal: 0,
    fototipo: '',
  },
  
  // Questionário 3: Histórico Familiar e Pessoal de Câncer de Pele
  historicoCancer: {
    historicoFamiliar: '',
    grauParentesco: '',
    tipoCancerFamiliar: '',
    diagnosticadoCancer: '',
    tipoCancerPessoal: '',
    lesoesPreCancerigenas: '',
    tratamentoLesoes: '',
    tipoTratamento: '',
  },
  
  // Questionário 4: Fatores de Risco e Proteção
  fatoresRisco: {
    exposicaoSol: '',
    frequenciaExposicao: '',
    queimadurasGraves: '',
    frequenciaQueimaduras: '',
    usoProtetorSolar: '',
    fpsUtilizado: '',
    roupasProtecao: '',
    bronzeamentoArtificial: '',
    visitasDermatologista: '',
    frequenciaVisitas: '',
    participacaoCampanhas: '',
  },
  
  // Questionário 5: Investigação de Câncer de Pele
  investigacaoLesoes: {
    lesoesRecentes: '',
    sintomasLesoes: '',
    tempoAlteracoes: '',
    caracteristicasLesoes: '',
    consultaMedica: '',
    diagnosticoMedico: '',
  },
  
  // Controle de Progresso
  progressoQuestionario: {
    etapaAtual: 1,
    totalEtapas: 5,
    concluido: false,
  }
};

const anamnesisSlice = createSlice({
  name: 'anamnesis',
  initialState,
  reducers: {
    atualizarQuestoesGerais: (state, action) => {
      state.questoesGerais = {...state.questoesGerais, ...action.payload};
    },
    
    atualizarAvaliacaoFototipo: (state, action) => {
      state.avaliacaoFototipo = {...state.avaliacaoFototipo, ...action.payload};
    },
    
    atualizarHistoricoCancer: (state, action) => {
      state.historicoCancer = {...state.historicoCancer, ...action.payload};
    },
    
    atualizarFatoresRisco: (state, action) => {
      state.fatoresRisco = {...state.fatoresRisco, ...action.payload};
    },
    
    atualizarInvestigacaoLesoes: (state, action) => {
      state.investigacaoLesoes = {...state.investigacaoLesoes, ...action.payload};
    },
    
    avancarEtapa: (state) => {
      if (state.progressoQuestionario.etapaAtual < state.progressoQuestionario.totalEtapas) {
        state.progressoQuestionario.etapaAtual += 1;
      }
      
      if (state.progressoQuestionario.etapaAtual === state.progressoQuestionario.totalEtapas) {
        state.progressoQuestionario.concluido = true;
      }
    },
    
    voltarEtapa: (state) => {
      if (state.progressoQuestionario.etapaAtual > 1) {
        state.progressoQuestionario.etapaAtual -= 1;
        state.progressoQuestionario.concluido = false;
      }
    },
    
    resetarQuestionario: (state) => {
      return initialState;
    }
  }
});

export const { 
  atualizarQuestoesGerais,
  atualizarAvaliacaoFototipo,
  atualizarHistoricoCancer,
  atualizarFatoresRisco,
  atualizarInvestigacaoLesoes,
  avancarEtapa,
  voltarEtapa,
  resetarQuestionario
} = anamnesisSlice.actions;

export default anamnesisSlice.reducer;