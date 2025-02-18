import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UnitSelectionModal = ({ visible, onClose, onSelectUnit }) => {
  const healthUnits = [
    {
      id: 1,
      name: 'Unidade Lorem Ipsum',
      address: 'Endereço da unidade Lorem Ipsum'
    },
    {
      id: 2,
      name: 'Unidade Lorem Ipsum',
      address: 'Endereço da unidade Lorem Ipsum'
    },
    {
      id: 3,
      name: 'Unidade Lorem Ipsum',
      address: 'Endereço da unidade Lorem Ipsum'
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

const styles = StyleSheet.create({
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

export default UnitSelectionModal;