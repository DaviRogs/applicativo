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
import { injuryService } from './injuryService';

const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const InjuryListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  const injuries = useSelector(state => state.injury.injuries);
  const isLoading = useSelector(state => state.injury.isLoading);
  const isSaving = useSelector(state => state.injury.isSaving);
  
  const patientData = route.params?.patientData;
  
  useEffect(() => {
    if (route.params?.newInjury) {
      const newInjury = route.params.newInjury;
      const injuryWithUniqueId = {
        ...newInjury,
        id: newInjury.id || generateUniqueId()
      };
      
      const isDuplicate = injuries.some(injury => injury.id === injuryWithUniqueId.id);
      if (isDuplicate) {
        injuryWithUniqueId.id = generateUniqueId();
      }
      
      dispatch(setInjuries([...injuries, injuryWithUniqueId]));
      navigation.setParams({ newInjury: undefined });
    }
  }, [route.params?.newInjury, dispatch, injuries]);
  
  useEffect(() => {
    if (route.params?.updatedInjury) {
      const updatedInjury = route.params.updatedInjury;
      if (!updatedInjury.id) {
        updatedInjury.id = generateUniqueId();
      }
      
      const updatedInjuries = injuries.map(injury => 
        injury.id === updatedInjury.id ? updatedInjury : injury
      );
      dispatch(setInjuries(updatedInjuries));
      navigation.setParams({ updatedInjury: undefined });
    }
  }, [route.params?.updatedInjury, dispatch, injuries]);

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
    // Reset form state before navigating
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
              // Pass the injuries back to NovoPaciente screen
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('NovoPaciente')}
            disabled={isSaving}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro de lesões</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {injuries.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="healing" size={48} color="#cccccc" />
                <Text style={styles.emptyStateText}>Nenhuma lesão registrada</Text>
              </View>
            ) : (
              injuries.map((injury, index) => (
                <View 
                  // Use a combination of ID and index to ensure uniqueness
                  key={injury.id ? `injury-${injury.id}` : `injury-index-${index}`} 
                  style={styles.injuryCard}
                >
                  <TouchableOpacity
                    style={styles.injuryContent}
                    onPress={() => handleEditInjury(injury)}
                  >
                    <Text style={styles.injuryLocation}>Local: {injury.location}</Text>
                    <Text style={styles.injuryDescription}>{injury.description}</Text>
                    {injury.photos && injury.photos.length > 0 && (
                      <Text style={styles.photosInfo}>
                        <Icon name="photo" size={14} color="#666" /> {injury.photos.length} {injury.photos.length === 1 ? 'foto' : 'fotos'}
                      </Text>
                    )}
                    <Text style={styles.dateInfo}>
                      {new Date(injury.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.injuryActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditInjury(injury)}
                    >
                      <Icon name="edit" size={20} color="#1e3d59" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteInjury(injury)}
                    >
                      <Icon name="delete" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleAddNewInjury}
            disabled={isSaving}
          >
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.floatingButtonText}>Registrar lesão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveAllButton, isSaving && styles.savingButton]}
            onPress={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.saveButtonText}>Salvando...</Text>
              </>
            ) : (
              <>
                <Icon name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Finalizar registro</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Your existing styles...
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  injuryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  injuryContent: {
    flex: 1,
  },
  injuryActions: {
    justifyContent: 'space-around',
    padding: 4,
  },
  injuryLocation: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3d59',
    marginBottom: 4,
  },
  injuryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  photosInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  dateInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  editButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  buttonContainer: {
    padding: 16,
  },
  floatingButton: {
    backgroundColor: '#1e3d59',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  floatingButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  saveAllButton: {
    backgroundColor: '#3d8577',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  savingButton: {
    backgroundColor: '#888',
  },
  saveButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default InjuryListScreen;