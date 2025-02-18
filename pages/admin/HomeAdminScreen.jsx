import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { selectHasAdminAccess } from '../../store/userSlice';

const FlyoutMenu = ({ visible, onClose, onSelectUnit }) => {
  const healthUnits = [
    {
      id: 1,
      name: 'Unidade basica de saude 1 ',
      address: 'Endereço da Unidade basica de saude 1'
    },
    {
      id: 2,
      name: 'Unidade basica de saude 2',
      address: 'Endereço da Unidade basica de saude 2'
    },
    {
      id: 3,
      name: 'Unidade basica de saude 3',
      address: 'Endereço da Unidade basica de saude 3'
    }
  ];

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
            <Text style={styles.modalTitle}>Escolha a Unidade a ser gerenciada</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.unitList}>
            {healthUnits.map((unit) => (
              <TouchableOpacity
                key={unit.id}
                style={styles.unitItem}
                onPress={() => {
                  onSelectUnit(unit);
                  onClose();
                }}
              >
                <Icon name="business" size={24} color="#1e3d59" />
                <View style={styles.unitItemContent}>
                  <Text style={styles.unitItemName}>{unit.name}</Text>
                  <Text style={styles.unitItemAddress}>{unit.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const HomeAdminScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const hasAdminAccess = useSelector(selectHasAdminAccess);

  useEffect(() => {
    // If user has admin access and no unit is selected, show the menu
    if (hasAdminAccess && !selectedUnit) {
      setMenuVisible(true);
    }
  }, [hasAdminAccess, selectedUnit]);

  const handleUnitSelection = (unit) => {
    setSelectedUnit(unit);
    // Here you could also dispatch an action to store the selected unit in Redux
  };

  return (
    <View style={styles.container}>
      <FlyoutMenu 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelectUnit={handleUnitSelection}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        {hasAdminAccess && (
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Icon name="more-vert" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Gerenciamento de Unidade{'\n'}de Saúde</Text>

        {selectedUnit && (
          <View style={styles.unitCard}>
            <View style={styles.unitInfo}>
              <Icon name="business" size={24} color="#1e3d59" />
              <Text style={styles.unitName}>{selectedUnit.name}</Text>
              <Text style={styles.unitAddress}>{selectedUnit.address}</Text>
            </View>

            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => navigation.navigate('ProfessionalsList')}
              >
                <Icon name="people" size={24} color="#1e3d59" />
                <Text style={styles.statLabel}>Profissionais</Text>
                <Text style={styles.statValue}>33</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.statItem}>
                <Icon name="person" size={24} color="#1e3d59" />
                <Text style={styles.statLabel}>Pacientes</Text>
                <Text style={styles.statValue}>440</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
    justifyContent: 'space-between',
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
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 24,
    lineHeight: 32,
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unitInfo: {
    marginBottom: 24,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e3d59',
    marginTop: 12,
    marginBottom: 4,
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e3d59',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e3d59',
  },
  unitList: {
    maxHeight: '80%',
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  unitItemContent: {
    marginLeft: 12,
  },
  unitItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  unitItemAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeAdminScreen;