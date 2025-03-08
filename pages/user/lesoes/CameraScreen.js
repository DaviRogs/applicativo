import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  // Get camera permissions
  useEffect(() => {
    (async () => {
      // Different approach for web vs native
      if (Platform.OS === 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(status === 'granted');
      } else {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  // Take picture using camera
  const takePicture = async () => {
    if (!cameraReady || !cameraRef.current) return;
    
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });
      
      setLoading(false);
      navigation.navigate('PhotoPreview', { photo });
    } catch (error) {
      setLoading(false);
      console.error('Error taking picture:', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto. Tente novamente.');
    }
  };

  // Select image from library (for web)
  const selectImage = async () => {
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
        navigation.navigate('PhotoPreview', { photo: result.assets[0] });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error selecting image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    }
  };

  // Handle permissions not granted
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Câmera</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.permissionText}>Verificando permissões de câmera...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Câmera</Text>
          </View>
          <View style={styles.permissionContainer}>
            <Icon name="no-photography" size={64} color="#e74c3c" />
            <Text style={styles.permissionTitle}>Acesso negado</Text>
            <Text style={styles.permissionText}>
              Para tirar fotos, permita o acesso à câmera nas configurações do dispositivo.
            </Text>
            <TouchableOpacity 
              style={styles.alternativeButton}
              onPress={Platform.OS === 'web' ? selectImage : () => navigation.goBack()}
            >
              <Text style={styles.alternativeButtonText}>
                {Platform.OS === 'web' ? 'Selecionar da galeria' : 'Voltar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Web alternative - file picker instead of camera
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Adicionar Imagem</Text>
          </View>
          
          <View style={styles.webUploadContainer}>
            <Icon name="cloud-upload" size={64} color="#1e3d59" />
            <Text style={styles.webUploadTitle}>Selecione uma imagem</Text>
            <Text style={styles.webUploadText}>
              Escolha uma imagem do seu computador para registrar a lesão
            </Text>
            
            <TouchableOpacity 
              style={styles.webSelectButton}
              onPress={selectImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="photo-library" size={20} color="#fff" />
                  <Text style={styles.webSelectButtonText}>Selecionar imagem</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Native camera implementation
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro de lesões</Text>
        </View>

        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.back}
            onCameraReady={() => setCameraReady(true)}
            ratio="4:3"
          >
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                Certifique-se de que a foto está nítida
              </Text>
            </View>
          </Camera>

          <View style={styles.captureContainer}>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
              disabled={loading || !cameraReady}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Icon name="camera" size={32} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 90 : 80,
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1e3d59',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  alternativeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#1e3d59',
    borderRadius: 8,
  },
  alternativeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  webUploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  webUploadTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  webUploadText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
    maxWidth: 400,
  },
  webSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  webSelectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});