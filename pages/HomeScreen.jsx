import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FlyoutMenu from '../components/FlyoutMenu';

const HomeScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const attendanceData = [
    { name: 'Pedro alves', cpf: '152.125.125.22', date: '15/02' },
    { name: 'Paulo silva', cpf: '152.125.125.22', date: '12/02' },
    { name: 'Joana maria silva', cpf: '152.125.125.22', date: '09/02' },
    { name: 'Joaninha', cpf: '152.125.125.22', date: '08/02' },
    { name: 'Pedrinho', cpf: '152.125.125.22', date: '05/02' },
  ];

  return (
    <View style={styles.container}>
      <FlyoutMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="more-vert" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Atendimentos finalizados</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Icon name="calendar-today" size={20} color="#1e3d59" />
            <Text style={styles.summaryLabel}>Dia</Text>
            <Text style={styles.summaryValue}>10</Text>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="date-range" size={20} color="#1e3d59" />
            <Text style={styles.summaryLabel}>Mês</Text>
            <Text style={styles.summaryValue}>12</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Atendimentos em aberto</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar"
          placeholderTextColor="#999"
        />

        {attendanceData.map((item, index) => (
          <View key={index} style={styles.attendanceCard}>
            <View>
              <Text style={styles.attendanceName}>{item.name}</Text>
              <Text style={styles.attendanceIp}>{item.cpf}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Icon name="calendar-today" size={16} color="#666" />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.newAttendanceButton}>
          <Text style={styles.newAttendanceText}>Novo Atendimento</Text>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: 26,
    height: 90,
    paddingLeft: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e3d59',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  attendanceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  attendanceIp: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 4,
    color: '#666',
  },
  newAttendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3d59',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  newAttendanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
});

export default HomeScreen;