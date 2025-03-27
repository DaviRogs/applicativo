import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FlyoutMenu from '../../components/FlyoutMenu';
import { useSelector } from 'react-redux';
import { API_URL } from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';


const HomeScreen = ({  }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [currentDateTimeUTC] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  });
  const user = useSelector(state => state.user.userData);
  const authenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.accessToken);

      const navigation = useNavigation();
    
      useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            navigation.navigate('Home');
            return true; // Prevent default behavior
          };
      
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
          return () => 
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
      );
    

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const fetchAtendimentos = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/listar-atendimentos-usuario-logado`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erro ao carregar os atendimentos');
      Alert.alert(
        'Erro',
        'Não foi possível carregar os atendimentos',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && token) {
      fetchAtendimentos();
    }
  }, [authenticated, token]);

  const filteredAttendances = attendanceData.filter(attendance => 
    attendance.nome_paciente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendance.cpf_paciente.includes(searchQuery)
  );

  const getDailySummary = () => {
    const today = currentDateTimeUTC.split(' ')[0];
    return attendanceData.filter(attendance => 
      attendance.data_atendimento.startsWith(today)
    ).length;
  };

  const getMonthlySummary = () => {
    const [year, month] = currentDateTimeUTC.split('-');
    return attendanceData.filter(attendance => {
      const [attendanceYear, attendanceMonth] = attendance.data_atendimento.split('-');
      return attendanceYear === year && attendanceMonth === month;
    }).length;
  };

  const renderItem = ({ item }) => (
    <View style={styles.attendanceCard}>
      <View>
        <Text style={styles.attendanceName}>{item.nome_paciente}</Text>
        <Text style={styles.attendanceIp}>{formatCPF(item.cpf_paciente)}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Icon name="calendar-today" size={16} color="#666" />
        <Text style={styles.dateText}>{formatDate(item.data_atendimento)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1e3d59" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      
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

      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Atendimentos finalizados</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Icon name="calendar-today" size={20} color="#1e3d59" />
              <Text style={styles.summaryLabel}>Dia</Text>
              <Text style={styles.summaryValue}>{getDailySummary()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Icon name="date-range" size={20} color="#1e3d59" />
              <Text style={styles.summaryLabel}>Mês</Text>
              <Text style={styles.summaryValue}>{getMonthlySummary()}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Atendimentos em aberto</Text>
          
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por nome ou CPF"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="cancel" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {filteredAttendances.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum atendimento encontrado</Text>
            </View>
          ) : (
            <FlatList
              data={filteredAttendances}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.newAttendanceButton} 
          onPress={() => { navigation.navigate('NovoAtendimento') }}
        >
          <Text style={styles.newAttendanceText}>Novo Atendimento</Text>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  contentContainer: {
    flex: 1,
    paddingBottom: 80, // Space for the button
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    padding: 0,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 4,
  },
  dateText: {
    marginLeft: 4,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  newAttendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3d59',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  newAttendanceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;