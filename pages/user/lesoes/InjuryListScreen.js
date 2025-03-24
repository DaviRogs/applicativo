import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import {
  resetForm,
  deleteInjury,
  setInjuries,
  setLoading,
  setSaving,
} from '../../../store/injurySlice';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const InjuryListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  const injuries = useSelector(state => state.injury.injuries);
  const isLoading = useSelector(state => state.injury.isLoading);
  const isSaving = useSelector(state => state.injury.isSaving);
  
  const patientData = route.params?.patientData;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('NovoPaciente');
        return true; // Prevent default behavior
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => 
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const handleDeleteInjury = (injury) => {
    Alert.alert(
      "Excluir lesão",
      `Tem certeza que deseja excluir "${injury.location}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              dispatch(setLoading(true));
              dispatch(deleteInjury(injury.id));
              dispatch(setLoading(false));
            } catch (error) {
              console.error('Error deleting injury:', error);
              Alert.alert('Erro', 'Não foi possível excluir a lesão.');
              dispatch(setLoading(false));
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEditInjury = (injury) => {
    dispatch(resetForm()); 
    navigation.navigate('AddInjury', { injury });
  };

  const handleAddNewInjury = () => {
    dispatch(resetForm());
    navigation.navigate('AddInjury');
  };

  const handleSaveAll = async () => {
    if (injuries.length === 0) {
      Alert.alert('Aviso', 'Não há lesões para salvar.');
      return;
    }
    
    dispatch(setSaving(true));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch(setSaving(false));
      Alert.alert(
        'Sucesso', 
        'Todas as lesões foram salvas com sucesso!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.navigate('NovoPaciente', { 
                patientData,
                injuries
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving injuries:', error);
      dispatch(setSaving(false));
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as lesões. Tente novamente.');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Icon name="healing" size={60} color="#1e3d59" />
      </View>
      <Text style={styles.emptyStateTitle}>Nenhuma lesão registrada</Text>
      <Text style={styles.emptyStateText}>
        Clique no botão abaixo para começar a registrar as lesões do paciente.
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={handleAddNewInjury}
        activeOpacity={0.8}
      >
        <Icon name="add-circle" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.emptyStateButtonText}>Registrar primeira lesão</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('NovoPaciente')}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro de lesões</Text>
          <View style={styles.headerRight}>
            <Text style={styles.injuryCount}>
              {injuries.length} {injuries.length === 1 ? 'lesão' : 'lesões'}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loaderCard}>
              <ActivityIndicator size="large" color="#1e3d59" />
              <Text style={styles.loadingText}>Carregando lesões...</Text>
            </View>
          </View>
        ) : (
          <>
            {injuries.length === 0 ? (
              renderEmptyState()
            ) : (
              <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {injuries.map((injury, index) => (
                  <View 
                    key={injury.id ? `injury-${injury.id}` : `injury-index-${index}`} 
                    style={styles.injuryCard}
                  >
                    <TouchableOpacity
                      style={styles.injuryContent}
                      onPress={() => handleEditInjury(injury)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.injuryHeader}>
                        <Text style={styles.injuryLocation}>{injury.location}</Text>
                        <Text style={styles.dateInfo}>
                          {new Date(injury.date).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      
                      <Text style={styles.injuryDescription} numberOfLines={2}>
                        {injury.description}
                      </Text>
                      
                      {injury.photos && injury.photos.length > 0 && (
                        <View style={styles.photoSection}>
                          <View style={styles.photoInfoContainer}>
                            <Icon name="photo-library" size={16} color="#1e3d59" />
                            <Text style={styles.photosInfo}>
                              {injury.photos.length} {injury.photos.length === 1 ? 'foto' : 'fotos'} anexada{injury.photos.length === 1 ? '' : 's'}
                            </Text>
                          </View>
                          
                          {injury.photos.length > 0 && (
                            <View style={styles.thumbnailContainer}>
                              {injury.photos.slice(0, 3).map((photo, photoIndex) => (
                                <Image 
                                  key={`photo-${photoIndex}`}
                                  source={{ uri: photo.uri }}
                                  style={styles.thumbnail}
                                />
                              ))}
                              {injury.photos.length > 3 && (
                                <View style={styles.morePhotosIndicator}>
                                  <Text style={styles.morePhotosText}>+{injury.photos.length - 3}</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    <View style={styles.injuryActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditInjury(injury)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <View style={[styles.actionIcon, styles.editIcon]}>
                          <Icon name="edit" size={18} color="#1e3d59" />
                        </View>
                        <Text style={styles.actionText}>Editar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteInjury(injury)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <View style={[styles.actionIcon, styles.deleteIcon]}>
                          <Icon name="delete" size={18} color="#e74c3c" />
                        </View>
                        <Text style={[styles.actionText, styles.deleteText]}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}

        {injuries.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={handleAddNewInjury}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.floatingButtonText}>Registrar nova lesão</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveAllButton, isSaving && styles.savingButton]}
              onPress={handleSaveAll}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <View style={styles.savingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.saveButtonText}>Salvando registros...</Text>
                </View>
              ) : (
                <View style={styles.buttonContentContainer}>
                  <Icon name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Finalizar registro</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 1,
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 90 : 100,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 60,
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '90%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#e8f0f8',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#1e3d59',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  injuryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eaeef3',
  },
  injuryContent: {
    padding: 16,
  },
  injuryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  injuryLocation: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    flex: 1,
  },
  dateInfo: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  injuryDescription: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
  photoSection: {
    marginTop: 8,
  },
  photoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  photosInfo: {
    fontSize: 14,
    color: '#1e3d59',
    marginLeft: 6,
    fontWeight: '500',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eaeef3',
  },
  morePhotosIndicator: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: 'rgba(30, 61, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#1e3d59',
    fontSize: 16,
    fontWeight: '600',
  },
  injuryActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eaeef3',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editIcon: {
    backgroundColor: 'rgba(30, 61, 89, 0.1)',
  },
  deleteIcon: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3d59',
  },
  deleteText: {
    color: '#e74c3c',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeef3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  floatingButton: {
    backgroundColor: '#1e3d59',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  floatingButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  saveAllButton: {
    backgroundColor: '#3d8577',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  savingButton: {
    backgroundColor: '#909090',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InjuryListScreen;