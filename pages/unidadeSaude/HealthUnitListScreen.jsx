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
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';

export const HealthUnitListScreen = ({ navigation }) => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('2025-03-02 22:37:09');
  const [currentUser, setCurrentUser] = useState('hannanhunny01');
    const userData = useSelector(state => state.user.userData);


  // Get user role from Redux
  const HealthUnitList = useSelector(selectIsAdmin);
  const token = useSelector(state => state.auth.accessToken);

  // Set current date and time
  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setCurrentDate(formattedDate);
  }, []);

  // Fetch health units
  const fetchHealthUnits = async () => {
    // if (!isAdmin) {
    //   navigation.goBack();
    //   return;
    // }
    console.log('fetchHealthUnits');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8004/listar-unidades-saude', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar unidades de saúde.');
      }

      const data = await response.json();
      setUnits(data);
      setFilteredUnits(data);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao buscar as unidades de saúde.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchHealthUnits();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(
        unit => 
          unit.nome_unidade_saude.toLowerCase().includes(searchQuery.toLowerCase()) || 
          unit.cidade_unidade_saude.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.codigo_unidade_saude.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  }, [searchQuery, units]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchHealthUnits();
  };

  // Handle status change
  const handleStatusChange = async (status) => {
    if (!selectedUnit) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:8004/editar-unidade-saude/${selectedUnit.id}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_unidade_saude: selectedUnit.nome_unidade_saude,
          nome_localizacao: selectedUnit.nome_localizacao,
          codigo_unidade_saude: selectedUnit.codigo_unidade_saude,
          cidade_unidade_saude: selectedUnit.cidade_unidade_saude,
          fl_ativo: status
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar status da unidade de saúde.');
      }
      
      // Update local state
      const updatedUnits = units.map(unit => {
        if (unit.id === selectedUnit.id) {
          return { ...unit, fl_ativo: status };
        }
        return unit;
      });
      
      setUnits(updatedUnits);
      setFilteredUnits(
        filteredUnits.map(unit => {
          if (unit.id === selectedUnit.id) {
            return { ...unit, fl_ativo: status };
          }
          return unit;
        })
      );
      
      setStatusModalVisible(false);
      setSelectedUnit(null);
      
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao atualizar o status da unidade.');
      Alert.alert('Erro', err.message || 'Ocorreu um erro ao atualizar o status da unidade.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render each health unit card
  const renderUnitItem = ({ item }) => (
    <View style={styles.unitCard}>
      <View style={styles.unitInfo}>
        <Text style={styles.unitName}>{item.nome_unidade_saude}</Text>
        <Text style={styles.unitCode}>Código: {item.codigo_unidade_saude}</Text>
        <Text style={styles.unitCity}>{item.cidade_unidade_saude}</Text>
        <Text style={styles.unitAddress}>{item.nome_localizacao}</Text>
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
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditHealthUnit', { unit: item })}
          >
            <Icon name="edit" size={20} color="#1e3d59" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              setSelectedUnit(item);
              setStatusModalVisible(true);
            }}
            style={styles.statusButton}
          >
            <Icon name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Header with date and user
  const renderHeader = () => (
    <View style={styles.headerInfo}>
     <Text style={styles.userText}>Usuário: {userData?.nome_usuario}</Text>
             <Text style={styles.userText}>Email: {userData?.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unidades de Saúde</Text>
      </View>

      <View style={styles.content}>
        {renderHeader()}

        <Text style={styles.sectionTitle}>Unidades cadastradas</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome, código ou cidade"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.loadingText}>Carregando unidades...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={40} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHealthUnits}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredUnits}
            renderItem={renderUnitItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e3d59"]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="business" size={48} color="#999" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nenhuma unidade encontrada para esta busca.' : 'Nenhuma unidade cadastrada.'}
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterHealthUnit')}
        >
          <Text style={styles.addButtonText}>Cadastrar Nova Unidade</Text>
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
            {selectedUnit && (
              <Text style={styles.modalSubtitle}>
                {selectedUnit.nome_unidade_saude}
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
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitInfo: {
    marginBottom: 12,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 4,
  },
  unitCode: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  unitCity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 6,
    marginRight: 8,
  },
  statusButton: {
    padding: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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

export default HealthUnitListScreen;