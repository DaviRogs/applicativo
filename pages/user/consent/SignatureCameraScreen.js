import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SignatureCameraScreen = ({ navigation }) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setLoading(false);
        navigation.navigate('SignaturePreview', { photo });
      } catch (error) {
        setLoading(false);
        console.error('Failed to take picture:', error);
        Alert.alert('Erro', 'Não foi possível capturar a foto.');
      }
    }
  };

  const handlePickImage = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      setLoading(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('SignaturePreview', { photo: result.assets[0] });
      }
    } catch (error) {
      setLoading(false);
      console.error('Failed to pick image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!cameraPermission) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1e3d59" />
        <Text style={styles.permissionText}>
          Verificando permissões da câmera...
        </Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Permissão Necessária</Text>
        </View>

        <View style={styles.centerContent}>
          <Icon name="no-photography" size={64} color="#e74c3c" />
          <Text style={styles.permissionTitle}>Acesso à câmera necessário</Text>
          <Text style={styles.permissionText}>
            Para capturar a assinatura, permita o acesso à câmera do dispositivo.
          </Text>

          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>
              Permitir acesso à câmera
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.permissionButton, styles.galleryButton]} 
            onPress={handlePickImage}
          >
            <Text style={styles.permissionButtonText}>
              Selecionar da galeria
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.permissionButton, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.permissionButtonText}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capturar Assinatura</Text>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Posicione a assinatura do paciente dentro do quadro
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.galleryIcon}
            onPress={handlePickImage}
          >
            <Icon name="photo-library" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePicture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipIcon}
            onPress={toggleCameraFacing}
          >
            <Icon name="flip-camera-android" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  permissionButton: {
    backgroundColor: '#1e3d59',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    width: '80%',
    alignItems: 'center',
  },
  galleryButton: {
    backgroundColor: '#3d8577',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    flex: 1,
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  instructionContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    fontSize: 14,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  galleryIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  flipIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignatureCameraScreen;