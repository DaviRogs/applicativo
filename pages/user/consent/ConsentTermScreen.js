import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setSignaturePhoto, 
  removeSignaturePhoto, 
  setPatientInfo,
  setConsentAgreed,
  setLoading
} from '../../../store/consentTermSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConsentTermScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { 
    signaturePhoto, 
    signatureDate, 
    patientName, 
    patientId,
    isConsentAgreed, 
    loading 
  } = useSelector(state => state.consentTerm);
  const [readTerms, setReadTerms] = useState(false);
  
  // Extract patient data from route params
  useEffect(() => {
    if (route.params?.patientData) {
      const { nome_paciente, cpf_paciente } = route.params.patientData;
      dispatch(setPatientInfo({
        name: nome_paciente || '',
        id: cpf_paciente || ''
      }));
    }
  }, [route.params?.patientData, dispatch]);

  // Handle signature photo from camera
  useEffect(() => {
    if (route.params?.signaturePhoto) {
      dispatch(setSignaturePhoto(route.params.signaturePhoto));
      dispatch(setConsentAgreed(true));
      navigation.setParams({ signaturePhoto: null });
    }
  }, [route.params?.signaturePhoto, dispatch]);

  const handleCaptureSignature = () => {
    navigation.navigate('SignatureCamera');
  };

  const handleViewSignature = () => {
    navigation.navigate('SignaturePreview', { 
      photo: signaturePhoto,
      readOnly: true
    });
  };

  const handleDeleteSignature = () => {
    Alert.alert(
      "Remover assinatura",
      "Tem certeza que deseja remover esta assinatura?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: () => dispatch(removeSignaturePhoto())
        }
      ]
    );
  };

  const handleSaveConsent = () => {
    if (!signaturePhoto) {
      Alert.alert("Aviso", "É necessário capturar a assinatura do paciente.");
      return;
    }
    
    if (!readTerms) {
      Alert.alert("Aviso", "É necessário ler o termo de consentimento antes de prosseguir.");
      return;
    }

    dispatch(setLoading(true));
    
    // Simulating API call to save consent
    setTimeout(() => {
      dispatch(setLoading(false));
      Alert.alert(
        "Sucesso",
        "Termo de consentimento salvo com sucesso!",
        [{ 
          text: "OK", 
          onPress: () => navigation.navigate('NovoPaciente', { consentSigned: true }) 
        }]
      );
    }, 1000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termo de Consentimento</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom) {
            setReadTerms(true);
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.termContainer}>
          <Text style={styles.termTitle}>
            TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO
          </Text>
          
          <Text style={styles.termParagraph}>
            Eu, <Text style={styles.highlightText}>{patientName}</Text>, portador(a) do documento 
            <Text style={styles.highlightText}> {patientId}</Text>, declaro que fui devidamente 
            informado(a) e esclarecido(a) sobre os procedimentos, riscos e benefícios do 
            atendimento a ser prestado.
          </Text>
          
          <Text style={styles.termParagraph}>
            Autorizo a coleta, processamento e armazenamento dos meus dados pessoais e de saúde, 
            incluindo imagens e registros de lesões, para fins de diagnóstico, tratamento e 
            acompanhamento médico.
          </Text>
          
          <Text style={styles.termParagraph}>
            Entendo que estes dados serão utilizados apenas para finalidades relacionadas ao 
            meu atendimento e serão armazenados de forma segura, em conformidade com a 
            Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </Text>
          
          <Text style={styles.termParagraph}>
            Estou ciente de que posso solicitar acesso, retificação ou exclusão dos meus 
            dados pessoais a qualquer momento, exceto quando a lei exigir a retenção desses dados.
          </Text>
          
          <Text style={styles.termParagraph}>
            Ao assinar este documento, confirmo que li, compreendi e concordo com todas as 
            informações acima apresentadas.
          </Text>
        </View>
        
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Assinatura do Paciente</Text>
          
          {signaturePhoto ? (
            <View style={styles.signatureContainer}>
              <TouchableOpacity 
                style={styles.signaturePreview}
                onPress={handleViewSignature}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: signaturePhoto.uri }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              
              <View style={styles.signatureInfo}>
                {signatureDate && (
                  <Text style={styles.signatureDate}>
                    Assinado em: {formatDate(signatureDate)}
                  </Text>
                )}
                
                <TouchableOpacity 
                  style={styles.removeSignatureButton}
                  onPress={handleDeleteSignature}
                  disabled={loading}
                >
                  <Icon name="delete-outline" size={18} color="#e74c3c" />
                  <Text style={styles.removeSignatureText}>Remover assinatura</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={handleCaptureSignature}
              disabled={loading}
            >
              <Icon name="camera-alt" size={24} color="#1e3d59" />
              <Text style={styles.captureButtonText}>Capturar assinatura</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {!readTerms && (
          <Text style={styles.scrollPrompt}>
            Role até o final para ler todo o termo
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            (!signaturePhoto || !readTerms || loading) && styles.disabledButton
          ]}
          onPress={handleSaveConsent}
          disabled={!signaturePhoto || !readTerms || loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" size="small" style={styles.loader} />
              <Text style={styles.saveButtonText}>Processando...</Text>
            </>
          ) : (
            <Text style={styles.saveButtonText}>Confirmar e Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 44 : 26,
    height: Platform.OS === 'ios' ? 90 : 90,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  termContainer: {
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 24,
  },
  termTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  termParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
    textAlign: 'justify',
  },
  highlightText: {
    fontWeight: '600',
    color: '#1e3d59',
  },
  signatureSection: {
    marginBottom: 24,
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  signatureContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signaturePreview: {
    width: '100%',
    height: 160,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  signatureInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  signatureDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  removeSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  removeSignatureText: {
    color: '#e74c3c',
    fontSize: 14,
    marginLeft: 4,
  },
  captureButton: {
    width: '100%',
    height: 160,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#1e3d59',
    fontSize: 16,
    marginTop: 8,
  },
  scrollPrompt: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginRight: 8,
  },
});

export default ConsentTermScreen;