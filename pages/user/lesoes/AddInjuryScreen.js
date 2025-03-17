import React, { useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateFormField,
  setFormState,
  resetForm,
  removePhoto,
  addInjury,
  updateInjury,
  setSaving,
  addPhoto,
} from '../../../store/injurySlice';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const AddInjuryScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  const { location, description, photos, isEditing, injuryId } = useSelector(state => state.injury.formState);
  const isSaving = useSelector(state => state.injury.isSaving);


  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('InjuryList');
        return true; // Prevent default behavior
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => 
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );
  useEffect(() => {
    if (route.params?.injury) {
      const injury = route.params.injury;
      dispatch(setFormState({
        location: injury.location || '',
        description: injury.description || '',
        photos: injury.photos || [],
        isEditing: true,
        injuryId: injury.id,
      }));
      
      navigation.setParams({ injury: undefined });
    }
    
    return () => {
      if (navigation.getState().routes.slice(-1)[0]?.name === 'InjuryList') {
        dispatch(resetForm());
      }
    };
  }, [route.params?.injury, dispatch]);

  useEffect(() => {
    if (route.params?.selectedLocation) {
      dispatch(updateFormField({
        field: 'location',
        value: route.params.selectedLocation,
      }));
      
      navigation.setParams({ selectedLocation: undefined });
    }
  }, [route.params?.selectedLocation, dispatch]);

  useEffect(() => {
    if (route.params?.photo) {
      dispatch(addPhoto(route.params.photo));
      
      navigation.setParams({ photo: undefined });
    }
  }, [route.params?.photo, dispatch]);

  const handleRemovePhoto = (index) => {
    Alert.alert(
      "Remover foto",
      "Tem certeza que deseja remover esta foto?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Remover",
          onPress: () => dispatch(removePhoto(index)),
          style: "destructive"
        }
      ]
    );
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    dispatch(setSaving(true));
    
    const injuryData = {
      id: isEditing ? injuryId : (injuryId || generateUniqueId()),
      location,
      description,
      photos,
      title: location, // Using location as title
      date: new Date().toISOString(),
    };
  
    setTimeout(() => {
      dispatch(setSaving(false));
      
      if (isEditing) {
        dispatch(updateInjury(injuryData));
      } else {
        dispatch(addInjury(injuryData));
      }
      
      // Navigate without passing injury data - we'll use Redux state instead
      navigation.navigate('InjuryList');
      
      // Reset form after saving
      dispatch(resetForm());
    }, 500);
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


  const viewPhoto = (photo, index) => {
    navigation.navigate('PhotoPreview', { 
      photo,
      viewOnly: true,
      index,
      onDelete: () => handleRemovePhoto(index),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('InjuryList')}
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
              onPress={() => navigation.navigate('InjuryLocation')}
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
              onChangeText={(value) => dispatch(updateFormField({ field: 'description', value }))}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.photoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Fotos</Text>
              <Text style={styles.photoCount}>
                {photos.length > 0 ? 
                  `${photos.length} foto${photos.length > 1 ? 's' : ''} adicionada${photos.length > 1 ? 's' : ''}` : 
                  'Nenhuma foto adicionada'}
              </Text>
            </View>
            
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <TouchableOpacity onPress={() => viewPhoto(photo, index)}>
                    <Image 
                      source={{ uri: photo.uri }} 
                      style={styles.photoThumbnail} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
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
                          const newPhoto = { 
                            uri,
                            width: 800,
                            height: 600,
                            file
                          };
                          dispatch(addPhoto(newPhoto));
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
                <Text style={styles.addPhotoText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar alterações</Text>
          )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  addPhotoText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
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