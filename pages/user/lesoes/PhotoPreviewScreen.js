import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const PhotoPreviewScreen = ({ route, navigation }) => {
  const { photo } = route.params || {};

  if (!photo || !photo.uri) {
    Alert.alert('Erro', 'Imagem inválida', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    return null;
  }

  const handleSavePhoto = () => {
    navigation.navigate('AddInjury', { photo });
  };

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
          <Text style={styles.headerTitle}>Pré-visualização</Text>
        </View>

        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.discardButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={20} color="#1e3d59" />
            <Text style={styles.discardButtonText}>Descartar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSavePhoto}
          >
            <Icon name="check" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Usar esta foto</Text>
          </TouchableOpacity>
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
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  discardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e3d59',
  },
  discardButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e3d59',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#1e3d59',
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
});