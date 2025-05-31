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
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
// import { selectIsAdmin } from '../../store/userSlice';
import { API_URL } from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

export const HealthUnitListScreen = () => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const userData = useSelector((state) => state.user.userData);
  const navigation = useNavigation();

  // Get user role from Redux
  // const isAdmin = useSelector(selectIsAdmin);
  const token = useSelector((state) => state.auth.accessToken);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('HomeAdmin');
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  // Fetch health units
  const fetchHealthUnits = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/listar-unidades-saude`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar unidades de saúde.');
      }

      const data = await response.json();
      setUnits(data);
      setFilteredUnits(data);
    } catch (err) {
      setError(
        err.message || 'Ocorreu um erro ao buscar as unidades de saúde.',
      );
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
        (unit) =>
          unit.nome_unidade_saude
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          unit.cidade_unidade_saude
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          unit.codigo_unidade_saude
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
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

      const response = await fetch(
        `${API_URL}/editar-unidade-saude/${selectedUnit.id}`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome_unidade_saude: selectedUnit.nome_unidade_saude,
            nome_localizacao: selectedUnit.nome_localizacao,
            codigo_unidade_saude: selectedUnit.codigo_unidade_saude,
            cidade_unidade_saude: selectedUnit.cidade_unidade_saude,
            fl_ativo: status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Falha ao atualizar status da unidade de saúde.');
      }

      // Update local state
      const updatedUnits = units.map((unit) => {
        if (unit.id === selectedUnit.id) {
          return { ...unit, fl_ativo: status };
        }
        return unit;
      });

      setUnits(updatedUnits);
      setFilteredUnits(
        filteredUnits.map((unit) => {
          if (unit.id === selectedUnit.id) {
            return { ...unit, fl_ativo: status };
          }
          return unit;
        }),
      );

      setStatusModalVisible(false);
      setSelectedUnit(null);
    } catch (err) {
      setError(
        err.message || 'Ocorreu um erro ao atualizar o status da unidade.',
      );
      Alert.alert(
        'Erro',
        err.message || 'Ocorreu um erro ao atualizar o status da unidade.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render each health unit card
  const renderUnitItem = ({ item }) => (
    <View style={styles.unitCard}>
      <View style={styles.unitInfo}>
        <Text style={styles.unitName}>{item.nome_unidade_saude}</Text>
        <View style={styles.unitDetail}>
          <Icon
            name="local-offer"
            size={16}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.unitCode}>
            Código: {item.codigo_unidade_saude}
          </Text>
        </View>
        <View style={styles.unitDetail}>
          <Icon
            name="location-city"
            size={16}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.unitCity}>{item.cidade_unidade_saude}</Text>
        </View>
        <View style={styles.unitDetail}>
          <Icon name="place" size={16} color="#666" style={styles.detailIcon} />
          <Text style={styles.unitAddress}>{item.nome_localizacao}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <View
          style={[
            styles.statusBadge,
            item.fl_ativo ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text style={item.fl_ativo ? styles.activeText : styles.inactiveText}>
            {item.fl_ativo ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('EditHealthUnit', { unit: item })
            }
          >
            <Icon name="edit" size={20} color="#1e3d59" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedUnit(item);
              setStatusModalVisible(true);
            }}
            style={styles.statusButton}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Icon name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Header with user information from Redux
  const renderHeader = () => (
    <View style={styles.headerInfo}>
      <Text style={styles.userText}>Usuário: {userData?.nome_usuario}</Text>
      <Text style={styles.userText}>Email: {userData?.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('HomeAdmin')}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unidades de Saúde</Text>
      </View>

      <View style={styles.content}>
        {renderHeader()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Unidades cadastradas</Text>

          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por nome, código ou cidade"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Icon name="close" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.loadingText}>Carregando unidades...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchHealthUnits}
              activeOpacity={0.8}
            >
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#1e3d59']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="business" size={60} color="#ddd" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'Nenhuma unidade encontrada para esta busca.'
                    : 'Nenhuma unidade cadastrada.'}
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterHealthUnit')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Cadastrar Nova Unidade</Text>
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
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Status</Text>
              {selectedUnit && (
                <Text style={styles.modalSubtitle}>
                  {selectedUnit.nome_unidade_saude}
                </Text>
              )}
            </View>

            <View style={styles.modalContent}>
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
            </View>

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
    backgroundColor: '#f5f8fa',
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
    shadowRadius: 3,
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
  headerInfo: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  listContainer: {
    paddingBottom: 16,
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unitInfo: {
    marginBottom: 14,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 10,
  },
  unitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
  },
  unitCode: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  unitCity: {
    fontSize: 14,
    color: '#555',
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
    borderRadius: 20,
    backgroundColor: '#f5f8fa',
  },
  statusButton: {
    padding: 8,
    borderRadius: 20,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3d59',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
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
    color: 'rgba(255,255,255,0.8)',
  },
  modalContent: {
    padding: 16,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cancelButton: {
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HealthUnitListScreen;
