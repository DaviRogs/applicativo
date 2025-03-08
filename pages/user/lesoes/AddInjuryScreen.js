import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddInjuryScreen = ({ navigation, route }) => {
  // Initial state
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [injuryId, setInjuryId] = useState(null);
  
  // Handle receiving location from InjuryLocationScreen
  useEffect(() => {
    if (route.params?.selectedLocation) {
      setLocation(route.params.selectedLocation);
    }
  }, [route.params?.selectedLocation]);

  // Handle receiving photo from PhotoPreviewScreen
  useEffect(() => {
    if (route.params?.photo) {
      setPhotos([...photos, route.params.photo]);
      // Clear params after using them
      navigation.setParams({ photo: undefined });
    }
  }, [route.params?.photo]);

  // Handle editing existing injury
  useEffect(() => {
    if (route.params?.injury) {
      const injury = route.params.injury;
      setLocation(injury.location || '');
      setDescription(injury.description || '');
      setPhotos(injury.photos || []);
      setInjuryId(injury.id);
      setIsEditing(true);
    }
  }, [route.params?.injury]);

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const validateForm = () => {
    if (!location) {
      Alert.alert('Erro', 'Por favor, selecione o local da lesão');
      return false;
    }
    
    if (!description) {
      Alert.alert('Erro', 'Por favor, forneça uma descrição da lesão');
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const injuryData = {
      location,
      description,
      photos,
      title: location, // Using location as title
      date: new Date().toISOString(),
    };

    if (isEditing && injuryId) {
      // Handle update existing injury logic
      Alert.alert('Sucesso', 'Lesão atualizada com sucesso');
    } else {
      // Navigate back to list with new injury data
      navigation.navigate('InjuryList', { newInjury: injuryData });
    }
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
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Lesão' : 'Nova Lesão'}
          </Text>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Local da lesão <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => navigation.navigate('InjuryLocation', { currentLocation: location })}
            >
              <Text style={location ? styles.inputText : styles.placeholderText}>
                {location || "Selecione o local da lesão"}
              </Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva a lesão em detalhes..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.label}>Fotos</Text>
            
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image 
                    source={{ uri: photo.uri }} 
                    style={styles.photoThumbnail} 
                  />
                  <TouchableOpacity 
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    // Web file picker
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const uri = event.target.result;
                          setPhotos([...photos, { uri }]);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  } else {
                    // Native camera
                    navigation.navigate('Camera');
                  }
                }}
              >
                <Icon name="camera-alt" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar alterações</Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#e74c3c',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  input: {
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddInjuryScreen;