import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setSignaturePhoto } from '../../../store/consentTermSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SignaturePreviewScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { photo, readOnly } = route.params || {};
  
  if (!photo || !photo.uri) {
    navigation.goBack();
    return null;
  }
  
  const handleUseSignature = () => {
    dispatch(setSignaturePhoto(photo));
    navigation.navigate('ConsentTerm', { signaturePhoto: photo });
  };
  
  const handleRetake = () => {
    navigation.navigate('SignatureCamera');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
            onPress={() => navigation.goBack()}
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
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
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