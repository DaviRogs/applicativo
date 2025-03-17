import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import {API_URL} from '@env';

const EditProfessionalScreen = ({ navigation, route }) => {
  const { professional } = route.params || {};
  
  const isAdmin = useSelector(selectIsAdmin);
  const userUnit = useSelector(state => state.user.userData.unidadeSaude[0]);
  const userData = useSelector(state => state.user.userData);
  const token = useSelector(state => state.auth.accessToken);
  
  const [isActive, setIsActive] = useState(professional?.fl_ativo || false);
  const [selectedRole, setSelectedRole] = useState(professional?.nivel_acesso || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateCurrentDate = () => {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
      setCurrentDate(formattedDate);
    };
    
    updateCurrentDate();
    const intervalId = setInterval(updateCurrentDate, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const roles = [
    { id: 1, name: "Pesquisador", nivel_acesso: 1},
    { id: 2, name: "Supervisor", nivel_acesso: 2 },
    { id: 3, name: "Admin", nivel_acesso: 3 }
  ];

  const availableRoles = isAdmin 
    ? roles 
    : roles.filter(role => role.nivel_acesso !== 1); 

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    const cleaned = String(cpf).replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Get role name by nivel_acesso
  const getRoleName = (nivelAcesso) => {
    const role = roles.find(r => r.nivel_acesso === nivelAcesso);
    return role ? role.name : 'Não definido';
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const endpoint = isAdmin
        ? `${API_URL}/admin/editar-usuario`
        : `${API_URL}/supervisor/editar-usuario`;
      
      const requestBody = {
        cpf: professional.cpf,
        role_id: selectedRole,
        fl_ativo: isActive
      };
      
      if (isAdmin) {
        requestBody.unidade_saude = professional.unidade_saude || userUnit.id;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar o profissional.');
      }

      Alert.alert(
        "Sucesso",
        "Dados do profissional atualizados com sucesso!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao atualizar o profissional.');
      Alert.alert("Erro", err.message || 'Ocorreu um erro ao atualizar o profissional.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profissional</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <Icon name="account-circle" size={48} color="#1e3d59" />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{professional?.nome_usuario || 'Nome não disponível'}</Text>
            <Text style={styles.profileCpf}>{formatCPF(professional?.cpf) || 'CPF não disponível'}</Text>
            <Text style={styles.profileEmail}>{professional?.email || 'Email não disponível'}</Text>
          </View>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.userText}>Usuário: {userData?.nome_usuario || 'Usuário atual'}</Text>
          <Text style={styles.userText}>Email: {userData?.email || 'Email não disponível'}</Text>
          <Text style={styles.dateText}>{currentDate} (UTC)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Permissão</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setRoleModalVisible(true)}
          >
            <Text style={styles.selectButtonText}>
              {getRoleName(selectedRole)}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {isActive ? "Usuário Ativo" : "Usuário Inativo"}
          </Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#ddd", true: "#1e3d59" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Salvar alterações</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={roleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRoleModalVisible(false)}
        >
          <View 
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => {
              e.stopPropagation();
            }}
          >
            <Text style={styles.modalTitle}>Selecionar Permissão</Text>
            
            {availableRoles.map((role) => (
              <TouchableOpacity 
                key={role.id}
                style={[
                  styles.roleOption,
                  selectedRole === role.nivel_acesso && styles.selectedRoleOption
                ]}
                onPress={() => {
                  setSelectedRole(role.nivel_acesso);
                  setRoleModalVisible(false);
                }}
              >
                <Text 
                  style={[
                    styles.roleOptionText,
                    selectedRole === role.nivel_acesso && styles.selectedRoleText
                  ]}
                >
                  {role.name}
                </Text>
                {selectedRole === role.nivel_acesso && (
                  <Icon name="check" size={24} color="#1e3d59" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setRoleModalVisible(false)}
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
    marginTop: 5,
  },
  userText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
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
    color: '#333',
  },
  buttonContainer: {
    marginTop: 'auto',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9aa5b1',
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  profileCpf: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedRoleOption: {
    backgroundColor: 'rgba(30, 61, 89, 0.1)',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRoleText: {
    color: '#1e3d59',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
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

export default EditProfessionalScreen;