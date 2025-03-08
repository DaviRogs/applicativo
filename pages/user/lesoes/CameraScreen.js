import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';

const CameraScreen = ({ navigation }) => {
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const selectImage = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada para acessar a galeria');
        setLoading(false);
        return;
      }
      
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
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Erro', 'Câmera não inicializada');
      return;
    }
    
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      
      setLoading(false);
      navigation.navigate('PhotoPreview', { photo });
    } catch (error) {
      setLoading(false);
      console.error('Error taking picture:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  if (!cameraPermission) {
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
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.messageText}>Verificando permissões da câmera...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!cameraPermission.granted) {
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
            <Text style={styles.headerTitle}>Permissão Necessária</Text>
          </View>
          <View style={styles.centerContainer}>
            <Icon name="no-photography" size={64} color="#e74c3c" />
            <Text style={styles.titleText}>Acesso negado</Text>
            <Text style={styles.messageText}>
              Para tirar fotos, permita o acesso à câmera nas configurações do dispositivo.
            </Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={requestPermission}
            >
              <Text style={styles.buttonText}>
                Permitir acesso à câmera
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, {backgroundColor: '#3d8577', marginTop: 12}]}
              onPress={selectImage}
            >
              <Text style={styles.buttonText}>
                Selecionar da galeria
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, {backgroundColor: '#e74c3c', marginTop: 12}]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>
                Voltar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capturar foto</Text>
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.galleryButton}
            onPress={selectImage}
          >
            <Icon name="photo-library" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.flipButton}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 16,
    paddingBottom: 16,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '80%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e3d59',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen;