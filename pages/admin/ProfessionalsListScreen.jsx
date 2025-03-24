import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import {API_URL} from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const ProfessionalsListScreen = () => {
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('2025-03-24 04:45:52');
  const [currentUser, setCurrentUser] = useState('hannanhunny01');

  const navigation = useNavigation();

  // Get user role and unit from Redux
  const isAdmin = useSelector(selectIsAdmin);
  const userUnit = useSelector(state => state.user.userData.unidadeSaude[0]);
  const userData = useSelector(state => state.user.userData);
  const token = useSelector(state => state.auth.accessToken);
  const roles = [
    { id: 1, name: "Pesquisador", nivel_acesso: 3 },
    { id: 2, name: "Supervisor", nivel_acesso: 2 },
    { id: 3, name: "Admin", nivel_acesso: 1 }
  ];

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('HomeAdmin');
        return true; // Prevent default behavior
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => 
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );
  
  // Fetch professionals
  const fetchProfessionals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `${API_URL}/listar-usuarios-unidade-saude/${userUnit.id}`

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar profissionais.');
      }

      const data = await response.json();
      setProfessionals(data);
      setFilteredProfessionals(data);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao buscar os profissionais.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProfessionals(professionals);
    } else {
      const filtered = professionals.filter(
        prof => 
          prof.nome_usuario.toLowerCase().includes(searchQuery.toLowerCase()) || 
          prof.cpf.includes(searchQuery.replace(/\D/g, ''))
      );
      setFilteredProfessionals(filtered);
    }
  }, [searchQuery, professionals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfessionals();
  };

  // Format CPF
  const formatCPF = (cpf) => {
    const cleaned = String(cpf).replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Handle status change
  const handleStatusChange = async (status) => {
    if (!selectedProfessional) return;
    
    try {
      setIsLoading(true);
      
      // Use the endpoints from curl examples
      const endpoint = isAdmin
        ? `${API_URL}/admin/editar-usuario`
        : `${API_URL}/supervisor/editar-usuario`;
      
      const requestBody = {
        cpf: selectedProfessional.cpf,
        role_id: selectedProfessional.nivel_acesso,
        fl_ativo: status
      };
      
      // Add unidade_saude for admin users as per API requirements
      if (isAdmin) {
        requestBody.unidade_saude = selectedProfessional.unidade_saude || userUnit.id;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST', // Using POST as shown in curl examples
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar status do profissional.');
      }
      
      const updatedProfessionals = professionals.map(prof => {
        if (prof.id === selectedProfessional.id) {
          return { ...prof, fl_ativo: status };
        }
        return prof;
      });
      
      setProfessionals(updatedProfessionals);
      setFilteredProfessionals(
        filteredProfessionals.map(prof => {
          if (prof.id === selectedProfessional.id) {
            return { ...prof, fl_ativo: status };
          }
          return prof;
        })
      );
      
      setStatusModalVisible(false);
      setSelectedProfessional(null);
      
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao atualizar o status do profissional.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render each professional card
  const renderProfessionalItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.professionalCard}
      onPress={() => navigation.navigate('EditProfessional', { professional: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.profileIcon}>
          <Icon name="person" size={24} color="#fff" />
        </View>
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{item.nome_usuario}</Text>
          <Text style={styles.professionalCpf}>{formatCPF(item.cpf)}</Text>
          <Text style={styles.professionalEmail}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <View style={[
          styles.statusBadge,
          item.fl_ativo ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <Text style={item.fl_ativo ? styles.activeText : styles.inactiveText}>
            {item.fl_ativo ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            setSelectedProfessional(item);
            setStatusModalVisible(true);
          }}
          style={styles.statusButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="more-vert" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerInfo}>
      <View style={styles.userInfoRow}>
        <Icon name="person-outline" size={16} color="#1e3d59" style={styles.infoIcon} />
        <Text style={styles.userText}>Usuário: {userData?.nome_usuario || currentUser}</Text>
      </View>
      <View style={styles.userInfoRow}>
        <Icon name="email-outline" size={16} color="#1e3d59" style={styles.infoIcon} />
        <Text style={styles.userText}>Email: {userData?.email || 'hannanhunny01@example.com'}</Text>
      </View>
      <View style={styles.userInfoRow}>
        <Icon name="access-time" size={16} color="#1e3d59" style={styles.infoIcon} />
        <Text style={styles.dateText}>{currentDate} (UTC)</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('HomeAdmin')}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profissionais</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.unitInfoCard}>
          <View style={styles.unitIconContainer}>
            <Icon name="business" size={24} color="#1e3d59" />
          </View>
          <View style={styles.unitTextContainer}>
            <Text style={styles.unitName}>{userUnit?.nome_unidade_saude}</Text>
            <Text style={styles.unitAddress}>{userUnit?.nome_localizacao}</Text>
          </View>
        </View>

        {renderHeader()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profissionais cadastrados</Text>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por nome ou CPF"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="cancel" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.loadingText}>Carregando profissionais...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProfessionals}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredProfessionals}
            renderItem={renderProfessionalItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e3d59"]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="person-search" size={60} color="#ddd" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nenhum profissional encontrado para esta busca.' : 'Nenhum profissional cadastrado.'}
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterProfessional')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Cadastrar Profissional</Text>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Status Selection Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatusModalVisible(false)}
        >
          <View 
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => {
              e.stopPropagation();
            }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Status</Text>
              {selectedProfessional && (
                <Text style={styles.modalSubtitle}>
                  {selectedProfessional.nome_usuario}
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.statusOption, styles.activeOption]}
              onPress={() => handleStatusChange(true)}
            >
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statusOptionText}>Ativo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusOption, styles.inactiveOption]}
              onPress={() => handleStatusChange(false)}
            >
              <Icon name="cancel" size={24} color="#F44336" />
              <Text style={styles.statusOptionText}>Inativo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 44 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  unitInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unitIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unitTextContainer: {
    flex: 1,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 4,
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
  },
  headerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  userText: {
    fontSize: 14,
    color: '#555',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  listContainer: {
    paddingBottom: 16,
  },
  professionalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3d59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  professionalCpf: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  professionalEmail: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
  },
  activeText: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 13,
  },
  inactiveText: {
    color: '#D32F2F',
    fontWeight: '600',
    fontSize: 13,
  },
  statusButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3d59',
    padding: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1e3d59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    backgroundColor: '#1e3d59',
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  inactiveOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },
  statusOptionText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfessionalsListScreen;