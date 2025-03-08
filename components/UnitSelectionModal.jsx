import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { selectHasAdminAccess, updateUnidadeSaude ,selectIsAdmin } from '../store/userSlice';

const UnitSelectionModal = ({ visible, onClose, onSelectUnit }) => {
  const dispatch = useDispatch();
  const hasAdminAccess = useSelector(selectIsAdmin);
  const accessToken = useSelector(state => state.auth.accessToken);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthUnits, setHealthUnits] = useState([]);

  const fetchUnidadesSaude = async () => {
    if (!hasAdminAccess) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8004/listar-unidades-saude', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health units');
      }

      const data = await response.json();
      setHealthUnits(data);
    } catch (err) {
      console.error('Error fetching health units:', err);
      setError('Erro ao carregar unidades de saúde');
      
      Alert.alert(
        'Erro',
        'Não foi possível carregar as unidades de saúde. Por favor, tente novamente.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && hasAdminAccess) {
      fetchUnidadesSaude();
    }
  }, [visible, hasAdminAccess, accessToken]);

  const handleUnitSelection = (unit) => {
    if (!unit.fl_ativo) {
      Alert.alert(
        'Unidade Inativa',
        'Esta unidade de saúde está inativa no momento.',
        [{ text: 'OK' }]
      );
      return;
    }

    const formattedUnit = {
      id: unit.id,
      nome_unidade_saude: unit.nome_unidade_saude,
      nome_localizacao: unit.nome_localizacao,
      codigo_unidade_saude: unit.codigo_unidade_saude,
      cidade_unidade_saude: unit.cidade_unidade_saude,
      is_active: unit.fl_ativo,
      data_criacao: unit.data_criacao,
      data_atualizacao: unit.data_atualizacao
    };

    // Dispatch the update action directly
    dispatch(updateUnidadeSaude([formattedUnit]));
    
    // Call the original onSelectUnit function if provided
    if (onSelectUnit) {
      console.log('formattedUnit',formattedUnit);
      onSelectUnit(formattedUnit);
    }
    
    onClose();
  };

  const handleRetry = () => {
    fetchUnidadesSaude();
  };

  if (!hasAdminAccess) {
    return null;
  }

  const renderUnitItem = (unit) => (
    <TouchableOpacity
      key={unit.id}
      style={[
        styles.unitItem,
        !unit.fl_ativo && styles.inactiveUnit
      ]}
      onPress={() => handleUnitSelection(unit)}
    >
      <Icon 
        name="business" 
        size={24} 
        color={unit.fl_ativo ? "#1e3d59" : "#999"} 
      />
      <View style={styles.unitItemContent}>
        <Text style={[
          styles.unitItemName,
          !unit.fl_ativo && styles.inactiveText
        ]}>
          {unit.nome_unidade_saude}
        </Text>
        <Text style={[
          styles.unitItemAddress,
          !unit.fl_ativo && styles.inactiveText
        ]}>
          {unit.nome_localizacao}
        </Text>
        <View style={styles.unitItemFooter}>
          <Text style={styles.unitItemCode}>
            {unit.codigo_unidade_saude}
          </Text>
          {!unit.fl_ativo && (
            <Text style={styles.inactiveLabel}>Inativa</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Escolha a Unidade a ser gerenciada
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1e3d59" />
              <Text style={styles.loadingText}>
                Carregando unidades...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Icon name="error-outline" size={48} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : healthUnits.length === 0 ? (
            <View style={styles.centerContainer}>
              <Icon name="info-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>
                Nenhuma unidade de saúde encontrada
              </Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.unitList}
              showsVerticalScrollIndicator={false}
            >
              {healthUnits.map(renderUnitItem)}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e3d59',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1e3d59',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  unitList: {
    maxHeight: '100%',
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  inactiveUnit: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  unitItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  unitItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 4,
  },
  unitItemAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  unitItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitItemCode: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {
    color: '#999',
  },
  inactiveLabel: {
    fontSize: 12,
    color: '#ff6b6b',
    backgroundColor: '#fff0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default UnitSelectionModal;