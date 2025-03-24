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
        handleBackPress();
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

  const handleBackPress = () => {
    // Check if form has unsaved changes
    if (location || description || photos.length > 0) {
      Alert.alert(
        "Descartar alterações?",
        "Se voltar agora, as alterações não salvas serão perdidas.",
        [
          {
            text: "Continuar editando",
            style: "cancel"
          },
          {
            text: "Descartar",
            onPress: () => {
              dispatch(resetForm());
              navigation.navigate('InjuryList');
            }
          }
        ]
      );
    } else {
      navigation.navigate('InjuryList');
    }
  };

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
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Lesão' : 'Nova Lesão'}
          </Text>
        </View>

        <ScrollView 
          style={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Local da lesão <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.locationInput,
                  location ? styles.inputFilled : null
                ]}
                onPress={() => navigation.navigate('InjuryLocation')}
                activeOpacity={0.8}
              >
                <Text style={location ? styles.inputText : styles.placeholderText}>
                  {location || "Selecione o local da lesão"}
                </Text>
                <Icon name="chevron-right" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Descrição <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  description ? styles.inputFilled : null
                ]}
                placeholder="Descreva a lesão em detalhes..."
                value={description}
                onChangeText={(value) => dispatch(updateFormField({ field: 'description', value }))}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.photoSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Fotos</Text>
                <View style={styles.photoCountBadge}>
                  <Text style={styles.photoCount}>
                    {photos.length > 0 ? 
                      `${photos.length} foto${photos.length > 1 ? 's' : ''}` : 
                      'Nenhuma foto'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <TouchableOpacity 
                      onPress={() => viewPhoto(photo, index)}
                      activeOpacity={0.9}
                    >
                      <Image 
                        source={{ uri: photo.uri }} 
                        style={styles.photoThumbnail} 
                      />
                      <View style={styles.photoOverlay} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="remove-circle" size={22} color="#FF3B30" />
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
                  activeOpacity={0.8}
                >
                  <View style={styles.addPhotoIconContainer}>
                    <Icon name="camera-alt" size={26} color="#1e3d59" />
                  </View>
                  <Text style={styles.addPhotoText}>Adicionar foto</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.saveButton,
              isSaving && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveButtonText}>Salvando...</Text>
              </View>
            ) : (
              <View style={styles.saveButtonContent}>
                <Icon name="save" size={20} color="#fff" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Atualizar lesão' : 'Salvar lesão'}
                </Text>
              </View>
            )}
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
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFilled: {
    borderColor: '#c3d4e6',
    backgroundColor: '#f5f8ff',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  input: {
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoCountBadge: {
    backgroundColor: '#e8edf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  photoCount: {
    fontSize: 14,
    color: '#1e3d59',
    fontWeight: '500',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#c3d4e6',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
  },
  addPhotoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8edf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addPhotoText: {
    fontSize: 13,
    color: '#1e3d59',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8edf4',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#7a99b8',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft:  8 
  },
});

export default AddInjuryScreen;