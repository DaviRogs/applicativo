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
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import {API_URL} from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
  const userUnit = useSelector(state => state.user.userData?.unidadeSaude[0]);
  const token = useSelector(state => state.auth.accessToken);

  const roles = [
    { id: 1, name: "Pesquisador", nivel_acesso: 3, icon: "science" },
    { id: 2, name: "Supervisor", nivel_acesso: 2, icon: "supervisor-account" },
    { id: 3, name: "Admin", nivel_acesso: 1, icon: "admin-panel-settings" }
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
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('ProfessionalsList')}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Profissional</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Icon name="person-add" size={24} color="#1e3d59" />
            <Text style={styles.formTitle}>Informações do Profissional</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={20} color="#B71C1C" style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>CPF</Text>
            <View style={styles.inputContainer}>
              <Icon name="badge" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={handleCPFChange}
                keyboardType="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="exemplo@email.com"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Permissão</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setRoleMenuVisible(true)}
            >
              {selectedRole ? (
                <View style={styles.selectedRoleContainer}>
                  <Icon name={selectedRole.icon} size={20} color="#1e3d59" style={styles.roleIcon} />
                  <Text style={styles.selectButtonTextSelected}>{selectedRole.name}</Text>
                </View>
              ) : (
                <Text style={styles.selectButtonText}>Escolher opção</Text>
              )}
              <Icon name="keyboard-arrow-down" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.unitCard}>
          <View style={styles.unitCardHeader}>
            <Icon name="business" size={24} color="#1e3d59" />
            <Text style={styles.unitCardTitle}>Unidade de Saúde</Text>
          </View>
          
          <View style={styles.unitContent}>
            <Text style={styles.unitName}>{userUnit?.nome_unidade_saude}</Text>
            <View style={styles.unitAddressRow}>
              <Icon name="location-on" size={16} color="#666" style={styles.locationIcon} />
              <Text style={styles.unitAddress}>{userUnit?.nome_localizacao}</Text>
            </View>
            {userUnit?.codigo_unidade_saude && (
              <View style={styles.unitCodeBadge}>
                <Text style={styles.unitCode}>{userUnit.codigo_unidade_saude}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, (!cpf || !email || !selectedRole) && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading || !cpf || !email || !selectedRole}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Icon name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Cadastrar Profissional</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ProfessionalsList')}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <Icon name="close" size={20} color="#666" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Role Selection Modal */}
      <Modal
        visible={roleMenuVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Permissão</Text>
            </View>
            
            <View style={styles.modalBody}>
              {availableRoles.map(role => (
                <TouchableOpacity 
                  key={role.id}
                  style={[
                    styles.roleOption,
                    selectedRole?.id === role.id && styles.roleOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedRole(role);
                    setRoleMenuVisible(false);
                  }}
                >
                  <View style={styles.roleOptionContent}>
                    <Icon 
                      name={role.icon} 
                      size={24} 
                      color={selectedRole?.id === role.id ? "#1e3d59" : "#666"} 
                      style={styles.roleOptionIcon}
                    />
                    <Text 
                      style={[
                        styles.roleText,
                        selectedRole?.id === role.id && styles.roleTextSelected
                      ]}
                    >
                      {role.name}
                    </Text>
                  </View>
                  {selectedRole?.id === role.id && (
                    <Icon name="check" size={24} color="#1e3d59" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
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
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={80} color="#4CAF50" />
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
    backgroundColor: '#f5f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 140, 
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#B71C1C',
    fontSize: 14,
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    marginRight: 10,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#999',
  },
  selectButtonTextSelected: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  unitCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginLeft: 8,
  },
  unitContent: {
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  unitAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  unitAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unitCodeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f4fd',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  unitCode: {
    fontSize: 12,
    color: '#1e3d59',
    fontWeight: '500',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
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
  },
  modalBody: {
    padding: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roleOptionSelected: {
    backgroundColor: 'rgba(30, 61, 89, 0.05)',
  },
  roleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleOptionIcon: {
    marginRight: 12,
  },
  roleText: {
    fontSize: 14,
    color: '#333',
  },
  roleTextSelected: {
    fontWeight: '600',
    color: '#1e3d59',
  },
  modalCloseButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCloseText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  successModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3d59',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default RegisterProfessionalScreen;