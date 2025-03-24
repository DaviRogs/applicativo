import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  BackHandler,
  Alert,
  Dimensions
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setSignaturePhoto, setConsentAgreed } from '../../../store/consentTermSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SignaturePreviewScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { photo, readOnly } = route.params || {};
  
  useEffect(() => {
    if (!photo || !photo.uri) {
      handleSafeGoBack();
    }
  }, [photo]);
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleSafeGoBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
  
  const handleSafeGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.navigate('ConsentTerm');
    } else {
      if (readOnly) {
        navigation.navigate('ConsentTerm');
      } else {
        navigation.navigate('SignatureCamera');
      }
    }
  };
  
  const handleUseSignature = () => {
    dispatch(setSignaturePhoto(photo));
    dispatch(setConsentAgreed(true));
    
    try {
      if (navigation.canGoBack()) {
        navigation.navigate('ConsentTerm', { signaturePhoto: photo });
      } else {
        navigation.replace('ConsentTerm', { signaturePhoto: photo });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        "Erro de Navegação",
        "Ocorreu um erro ao retornar para a tela anterior.",
        [
          { text: "OK", onPress: () => navigation.navigate('ConsentTerm') }
        ]
      );
    }
  };
  
  const handleRetake = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SignatureCamera');
    }
  };

  if (!photo || !photo.uri) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleSafeGoBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {readOnly ? "Visualização da Assinatura" : "Confirmar Assinatura"}
        </Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.imageWrapper}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          
          {!readOnly && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Verifique se a assinatura está legível e clara
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {!readOnly ? (
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.retakeButton}
            onPress={handleRetake}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={20} color="#1e3d59" />
            <Text style={styles.retakeButtonText}>Capturar novamente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleUseSignature}
            activeOpacity={0.8}
          >
            <Icon name="check" size={22} color="#fff" />
            <Text style={styles.confirmButtonText}>Usar assinatura</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.singleButtonContainer}>
          <TouchableOpacity 
            style={styles.backToFormButton}
            onPress={handleSafeGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backToFormText}>Voltar ao formulário</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight || 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 70 : 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 16,
  },
  imageWrapper: {
    width: '100%',
    maxHeight: height * 0.7,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  instructionContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(30, 61, 89, 0.8)',
    borderRadius: 20,
    marginBottom: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    marginRight: 8,
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dde5ed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  retakeButtonText: {
    marginLeft: 8,
    color: '#1e3d59',
    fontSize: 12,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginLeft: 8,
    backgroundColor: '#1e3d59',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  singleButtonContainer: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  backToFormButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#1e3d59',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backToFormText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignaturePreviewScreen;