import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import {API_URL} from '@env';
import { useFocusEffect , useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';


const RegisterProfessionalScreen = () => {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const navigation = useNavigation();

  const isAdmin = useSelector(selectIsAdmin);
  const userUnit = useSelector(state => state.user.userData.unidadeSaude[0]);
  const token = useSelector(state => state.auth.accessToken);

  const roles = [
    { id: 1, name: "Pesquisador", nivel_acesso: 3 },
    { id: 2, name: "Supervisor", nivel_acesso: 2 },
    { id: 3, name: "Admin", nivel_acesso: 1 }
  ];


  const availableRoles = isAdmin 
    ? roles 
    : roles.filter(role => role.id !== 3); 

  const resetForm = () => {
    setCpf('');
    setEmail('');
    setSelectedRole(null);
    setError(null);
  };


        useFocusEffect(
          React.useCallback(() => {
            const onBackPress = () => {
              navigation.navigate('ProfessionalsList');
              return true; // Prevent default behavior
            };
        
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
        
            return () => 
              BackHandler.removeEventListener('hardwareBackPress', onBackPress);
          }, [navigation])
        );

  const handleRegister = async () => {
    if (!cpf || !email || !selectedRole) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateCPF(cpf)) {
      setError('CPF inválido. Verifique e tente novamente.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido. Verifique e tente novamente.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      
      const endpoint = isAdmin 
        ? `${API_URL}/admin/convidar-usuario` 
        : `${API_URL}/supervisor/convidar-usuario`;

      const requestBody = isAdmin 
        ? {
            cpf: cpf.replace(/\D/g, ''), 
            email,
            unidade_saude_id: userUnit.id,
            role_id: selectedRole.nivel_acesso
          }
        : {
            cpf: cpf.replace(/\D/g, ''), 
            email,
            role_id: selectedRole.nivel_acesso
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao cadastrar profissional');
      }

      setSuccessModalVisible(true);
      resetForm();
    } catch (error) {
      setError(error.message || 'Ocorreu um erro ao tentar cadastrar o profissional');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCPF = (cpf) => {
    const cpfClean = cpf.replace(/\D/g, '');
    return cpfClean.length === 11;
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const formatCPF = (text) => {
    const cleaned = text.replace(/\D/g, '');
    
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.replace(/^(\d{3})/, '$1.');
    }
    if (cleaned.length > 6) {
      formatted = formatted.replace(/^(\d{3})\.(\d{3})/, '$1.$2.');
    }
    if (cleaned.length > 9) {
      formatted = formatted.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-');
    }
    
    return formatted;
  };

  const handleCPFChange = (text) => {
    setCpf(formatCPF(text));
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    navigation.navigate('ProfessionalsList');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ProfessionalsList')}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Profissional</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={handleCPFChange}
            keyboardType="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="exemplo@email.com"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Permissão</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setRoleMenuVisible(true)}
          >
            <Text style={selectedRole ? styles.selectButtonTextSelected : styles.selectButtonText}>
              {selectedRole ? selectedRole.name : 'Escolher opção'}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.unitInfo}>
          <Text style={styles.label}>Unidade de Saúde</Text>
          <Text style={styles.unitName}>{userUnit?.nome_unidade_saude}</Text>
          <Text style={styles.unitAddress}>{userUnit?.nome_localizacao}</Text>
        </View>

        {/* Extra space at bottom to ensure content isn't hidden behind fixed buttons */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Fixed button container at bottom */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Cadastrar Profissional</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ProfessionalsList')}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Role Selection Modal */}
      <Modal
        visible={roleMenuVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Permissão</Text>
            
            {availableRoles.map(role => (
              <TouchableOpacity 
                key={role.id}
                style={styles.roleOption}
                onPress={() => {
                  setSelectedRole(role);
                  setRoleMenuVisible(false);
                }}
              >
                <Text style={styles.roleText}>{role.name}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setRoleMenuVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={72} color="#4CAF50" />
            </View>
            
            <Text style={styles.successModalTitle}>Convite Enviado!</Text>
            <Text style={styles.successModalText}>
              O convite foi enviado com sucesso para o email do profissional.
            </Text>
            
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding to account for fixed buttons
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#B71C1C',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectButtonTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  unitInfo: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  unitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3d59',
    marginBottom: 4,
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpace: {
    height: 20, // Additional empty space at bottom of scroll
  },
  // Fixed button container at bottom
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 5,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    color: '#1e3d59',
    textAlign: 'center',
  },
  roleOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roleText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  // Success Modal styles
  successModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    width: '100%',
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default RegisterProfessionalScreen;