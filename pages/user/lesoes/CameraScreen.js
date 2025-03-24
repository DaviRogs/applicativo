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
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const CameraScreen = ({ navigation }) => {
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [loading, setLoading] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  const cameraRef = useRef(null);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const toggleCameraFacing = () => {
    Animated.sequence([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
    
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode(current => {
      switch (current) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AddInjury');
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

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

  const flipInterpolation = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '0deg']
  });

  if (!cameraPermission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('AddInjury')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Câmera</Text>
          </View>
          <View style={styles.centerContainer}>
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#1e3d59" />
            </View>
            <Text style={styles.titleText}>Verificando câmera</Text>
            <Text style={styles.messageText}>Aguarde enquanto verificamos as permissões da câmera...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('AddInjury')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Permissão Necessária</Text>
          </View>
          <View style={styles.centerContainer}>
            <View style={styles.iconContainer}>
              <Icon name="no-photography" size={64} color="#e74c3c" />
            </View>
            <Text style={styles.titleText}>Acesso à câmera negado</Text>
            <Text style={styles.messageText}>
              Para tirar fotos, permita o acesso à câmera nas configurações do dispositivo.
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <Icon name="camera-alt" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                Permitir acesso à câmera
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={selectImage}
              activeOpacity={0.8}
            >
              <Icon name="photo-library" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                Selecionar da galeria
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.tertiaryButton}
              onPress={() => navigation.navigate('AddInjury')}
              activeOpacity={0.8}
            >
              <Icon name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        flashMode={flashMode}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('AddInjury')}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capturar foto</Text>
          <TouchableOpacity 
            style={styles.flashButton}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <Icon 
              name={
                flashMode === 'on' ? 'flash-on' : 
                flashMode === 'auto' ? 'flash-auto' : 'flash-off'
              } 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.focusFrame}>
          <View style={styles.focusCorner} />
          <View style={[styles.focusCorner, { top: 0, right: 0, transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.focusCorner, { bottom: 0, left: 0, transform: [{ rotate: '-90deg' }] }]} />
          <View style={[styles.focusCorner, { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] }]} />
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.galleryButton}
            onPress={selectImage}
            activeOpacity={0.7}
          >
            <View style={styles.galleryButtonInner}>
              <Icon name="photo-library" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, loading && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          
          <Animated.View
            style={{
              transform: [{ rotateY: flipInterpolation }]
            }}
          >
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              activeOpacity={0.7}
            >
              <View style={styles.flipButtonInner}>
                <Icon name="flip-camera-android" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            Posicione a lesão no centro do quadro e toque no botão para fotografar
          </Text>
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
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#feeaed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1e3d59',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3d8577',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#767676',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  focusFrame: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    bottom: '30%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },
  focusCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'rgba(255,255,255,0.8)',
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 20,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButtonDisabled: {
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  galleryButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  tipContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 12,
  },
  tipText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '80%',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});

export default CameraScreen;