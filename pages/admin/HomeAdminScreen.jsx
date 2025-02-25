import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FlyoutMenu from '../../components/FlyoutMenu';
import UnitSelectionModal from '../../components/UnitSelectionModal';
import { useSelector } from 'react-redux';
import { selectHasAdminAccess ,selectIsSupervisor} from '../../store/userSlice';

const HomeScreen = ({navigation}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  console.log(selectedUnit);
  const hasAdminAccess = useSelector(selectHasAdminAccess);


  useEffect(() => {
    if (hasAdminAccess && !selectedUnit) {
      setUnitModalVisible(true);
    }
  }, [hasAdminAccess, selectedUnit]);

  const handleUnitSelection = (unit) => {
    setSelectedUnit(unit);
    setUnitModalVisible(false); // Close the modal after selection
  };

  return (
    <View style={styles.container}>
      <FlyoutMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
      
      <UnitSelectionModal
        visible={unitModalVisible}
        onClose={() => setUnitModalVisible(false)}
        onSelectUnit={handleUnitSelection}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="more-vert" size={24} color="#fff" />
        </TouchableOpacity>
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
                <Text style={styles.statLabel}>ProfissionaiFlyoutMenus</Text>
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
});

export default HomeScreen;