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
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import {API_URL} from '@env';

const ProfessionalsListScreen = ({ navigation }) => {
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('2025-03-06 15:49:13');
  const [currentUser, setCurrentUser] = useState('hannanhunny01');

  // Get user role and unit from Redux
  const isAdmin = useSelector(selectIsAdmin);
  const userUnit = useSelector(state => state.user.userData.unidadeSaude[0]);
  const userData = useSelector(state => state.user.userData);
  const token = useSelector(state => state.auth.accessToken);
  const roles = [
    { id: 1, name: "Pesquisador", nivel_acesso: 1 },
    { id: 2, name: "Supervisor", nivel_acesso: 2 },
    { id: 3, name: "Admin", nivel_acesso: 3 }
  ];

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
    >
      <View>
        <Text style={styles.professionalName}>{item.nome_usuario}</Text>
        <Text style={styles.professionalCpf}>{formatCPF(item.cpf)}</Text>
        <Text style={styles.professionalEmail}>{item.email}</Text>
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
        >
          <Icon name="more-vert" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerInfo}>
      <Text style={styles.userText}>Usuário: {userData?.nome_usuario}</Text>
      <Text style={styles.userText}>Email: {userData?.email}</Text>
      <Text style={styles.dateText}>{currentDate} (UTC)</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profissionais</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.unitInfo}>
          <Icon name="business" size={20} color="#1e3d59" />
          <Text style={styles.unitName}>{userUnit?.nome_unidade_saude}</Text>
          <Text style={styles.unitAddress}>{userUnit?.nome_localizacao}</Text>
        </View>

        {renderHeader()}

        <Text style={styles.sectionTitle}>Profissionais cadastrados</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome ou CPF"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.loadingText}>Carregando profissionais...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={40} color="#F44336" />
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
                <Icon name="person-search" size={48} color="#999" />
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
        >
          <Text style={styles.addButtonText}>Cadastrar Profissional</Text>
          <Icon name="add" size={24} color="#1e3d59" />
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
            <Text style={styles.modalTitle}>Alterar Status</Text>
            {selectedProfessional && (
              <Text style={styles.modalSubtitle}>
                {selectedProfessional.nome_usuario}
              </Text>
            )}
            
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  unitInfo: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  unitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3d59',
    marginTop: 8,
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
  },
  headerInfo: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginTop: 5,
  },
  userText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  listContainer: {
    paddingBottom: 16,
  },
  professionalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  professionalCpf: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  professionalEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  activeText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 13,
  },
  inactiveText: {
    color: '#F44336',
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
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1e3d59',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    color: '#1e3d59',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
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
    marginTop: 12,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1e3d59',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  activeOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  inactiveOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  statusOptionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cancelButton: {
    marginTop: 8,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfessionalsListScreen;