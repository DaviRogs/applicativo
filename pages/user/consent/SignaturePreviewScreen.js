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
  Alert
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setSignaturePhoto, setConsentAgreed } from '../../../store/consentTermSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const SignaturePreviewScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { photo, readOnly } = route.params || {};
  
  // Check if we have a valid photo, if not, safely navigate back
  useEffect(() => {
    if (!photo || !photo.uri) {
      handleSafeGoBack();
    }
  }, [photo]);
  
  // Handle hardware back button
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
      navigation.goBack();
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
    
    // Navigate back to consent term screen with the new photo
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
      navigation.goBack(); // Go back to camera
    } else {
      navigation.navigate('SignatureCamera');
    }
  };

  if (!photo || !photo.uri) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleSafeGoBack}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {readOnly ? "Visualização da Assinatura" : "Confirmar Assinatura"}
        </Text>
      </View>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      {!readOnly && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.retakeButton}
            onPress={handleRetake}
          >
            <Icon name="refresh" size={24} color="#1e3d59" />
            <Text style={styles.retakeButtonText}>Capturar novamente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleUseSignature}
          >
            <Icon name="check" size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>Usar assinatura</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {readOnly && (
        <View style={styles.singleButtonContainer}>
          <TouchableOpacity 
            style={styles.backToFormButton}
            onPress={handleSafeGoBack}
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 60 : 70,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  retakeButtonText: {
    marginLeft: 8,
    color: '#1e3d59',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#1e3d59',
    borderRadius: 8,
  },
  confirmButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
  },
  singleButtonContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  backToFormButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#1e3d59',
    borderRadius: 8,
  },
  backToFormText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SignaturePreviewScreen;