import React, { useEffect } from 'react';
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
  Platform,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSignaturePhoto,
  removeSignaturePhoto,
  setPatientInfo,
  setConsentAgreed,
  setLoading,
} from '../../../store/consentTermSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const ConsentTermScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { signaturePhoto, signatureDate, patientName, patientId, loading } =
    useSelector((state) => state.consentTerm);

  // Extract patient data from route params
  useEffect(() => {
    if (route.params?.patientData) {
      const { nome_paciente, cpf_paciente } = route.params.patientData;
      dispatch(
        setPatientInfo({
          name: nome_paciente || '',
          id: cpf_paciente || '',
        }),
      );
    }
  }, [route.params?.patientData, dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [loading, signaturePhoto]),
  );

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
      readOnly: true,
    });
  };

  const handleDeleteSignature = () => {
    Alert.alert(
      'Remover assinatura',
      'Tem certeza que deseja remover esta assinatura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            dispatch(removeSignaturePhoto());
            dispatch(setConsentAgreed(false));
          },
        },
      ],
    );
  };

  const handleSaveConsent = () => {
    if (!signaturePhoto) {
      Alert.alert('Aviso', 'É necessário capturar a assinatura do paciente.');
      return;
    }

    dispatch(setLoading(true));
    dispatch(setConsentAgreed(true));

    // Simulating API call to save consent
    setTimeout(() => {
      dispatch(setLoading(false));
      Alert.alert('Sucesso', 'Termo de consentimento salvo com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.navigate('NovoPaciente', { consentSigned: true });
            } else {
              navigation.replace('NovoPaciente', { consentSigned: true });
            }
          },
        },
      ]);
    }, 1000);
  };

  const handleBackPress = () => {
    if (loading) return;

    if (signaturePhoto) {
      Alert.alert(
        'Sair sem salvar?',
        'Você fez alterações que não foram salvas. Deseja sair sem salvar?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          {
            text: 'Sair sem salvar',
            style: 'destructive',
            onPress: () => {
              navigation.navigate('NovoPaciente');
            },
          },
        ],
      );
    } else {
      if (navigation.canGoBack()) {
        navigation.navigate('NovoPaciente');
      } else {
        navigation.navigate('NovoPaciente');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          disabled={loading}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termo de Consentimento</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.termContainer}>
          <Text style={styles.termTitle}>
            TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO
          </Text>

          <Text style={styles.termParagraph}>
            Eu, <Text style={styles.highlightText}>{patientName}</Text>,
            portador(a) do documento
            <Text style={styles.highlightText}> {patientId}</Text>, declaro que
            fui devidamente informado(a) e esclarecido(a) sobre os
            procedimentos, riscos e benefícios do atendimento a ser prestado.
          </Text>

          <Text style={styles.termParagraph}>
            Autorizo a coleta, processamento e armazenamento dos meus dados
            pessoais e de saúde, incluindo imagens e registros de lesões, para
            fins de diagnóstico, tratamento e acompanhamento médico.
          </Text>

          <Text style={styles.termParagraph}>
            Entendo que estes dados serão utilizados apenas para finalidades
            relacionadas ao meu atendimento e serão armazenados de forma segura,
            em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº
            13.709/2018).
          </Text>

          <Text style={styles.termParagraph}>
            Estou ciente de que posso solicitar acesso, retificação ou exclusão
            dos meus dados pessoais a qualquer momento, exceto quando a lei
            exigir a retenção desses dados.
          </Text>

          <Text style={styles.termParagraph}>
            Ao assinar este documento, confirmo que li, compreendi e concordo
            com todas as informações acima apresentadas.
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
                <View style={styles.previewOverlay}>
                  <Icon name="fullscreen" size={24} color="#fff" />
                  <Text style={styles.previewText}>Visualizar</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.signatureInfo}>
                {signatureDate && (
                  <View style={styles.dateContainer}>
                    <Icon name="access-time" size={14} color="#666" />
                    <Text style={styles.signatureDate}>
                      {formatDate(signatureDate)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.removeSignatureButton}
                  onPress={handleDeleteSignature}
                  disabled={loading}
                >
                  <Icon name="delete-outline" size={18} color="#e74c3c" />
                  <Text style={styles.removeSignatureText}>
                    Remover assinatura
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCaptureSignature}
              disabled={loading}
            >
              <Icon name="camera-alt" size={40} color="#1e3d59" />
              <Text style={styles.captureButtonText}>Capturar assinatura</Text>
              <Text style={styles.captureButtonSubtext}>
                Tire uma foto da assinatura do paciente
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!signaturePhoto || loading) && styles.disabledButton,
          ]}
          onPress={handleSaveConsent}
          disabled={!signaturePhoto || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <>
              <ActivityIndicator
                color="#fff"
                size="small"
                style={styles.loader}
              />
              <Text style={styles.saveButtonText}>Processando...</Text>
            </>
          ) : (
            <>
              <Icon
                name="check-circle"
                size={22}
                color="#fff"
                style={styles.saveIcon}
              />
              <Text style={styles.saveButtonText}>Confirmar e Salvar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 90 : 80,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  termContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  termTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1e3d59',
    textAlign: 'center',
    marginBottom: 20,
  },
  termParagraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
    textAlign: 'justify',
  },
  highlightText: {
    fontWeight: '600',
    color: '#1e3d59',
  },
  signatureSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 16,
  },
  signatureContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signaturePreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    position: 'relative',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  signatureInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  signatureDate: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  removeSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ffefef',
    borderRadius: 16,
  },
  removeSignatureText: {
    color: '#e74c3c',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  captureButton: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e5eb',
    borderStyle: 'dashed',
  },
  captureButtonText: {
    color: '#1e3d59',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  captureButtonSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#b3c1cc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveIcon: {
    marginRight: 8,
  },
  loader: {
    marginRight: 10,
  },
});

export default ConsentTermScreen;
