import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import { API_URL } from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const EditProfessionalScreen = ({ route }) => {
  const { professional } = route.params || {};
  
  const isAdmin = useSelector(selectIsAdmin);
  const userUnit = useSelector(state => state.user.userData?.unidadeSaude[0]);
  const userData = useSelector(state => state.user.userData);
  const token = useSelector(state => state.auth.accessToken);
  
  const [isActive, setIsActive] = useState(professional?.fl_ativo || false);
  const [selectedRole, setSelectedRole] = useState(professional?.nivel_acesso || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const navigation = useNavigation();

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

  const roles = [
    { id: 1, name: "Pesquisador", nivel_acesso: 3, icon: "science" },
    { id: 2, name: "Supervisor", nivel_acesso: 2, icon: "supervisor-account" },
    { id: 3, name: "Admin", nivel_acesso: 1, icon: "admin-panel-settings" }
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

  // Get role icon by nivel_acesso
  const getRoleIcon = (nivelAcesso) => {
    const role = roles.find(r => r.nivel_acesso === nivelAcesso);
    return role ? role.icon : 'help-outline';
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
        [{ text: "OK", onPress: () => navigation.navigate('ProfessionalsList')}]
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
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('ProfessionalsList')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Profissional</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.profileIconContainer}>
              <Icon name="person" size={36} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{professional?.nome_usuario || 'Nome não disponível'}</Text>
              <Text style={styles.profileCpf}>{formatCPF(professional?.cpf) || 'CPF não disponível'}</Text>
              <Text style={styles.profileEmail}>{professional?.email || 'Email não disponível'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.unitSection}>
            <View style={styles.unitRow}>
              <Icon name="business" size={20} color="#1e3d59" style={styles.rowIcon} />
              <Text style={styles.unitText}>{userUnit?.nome_unidade_saude || 'Unidade não disponível'}</Text>
            </View>
            <View style={styles.unitRow}>
              <Icon name="location-on" size={20} color="#1e3d59" style={styles.rowIcon} />
              <Text style={styles.unitText}>{userUnit?.nome_localizacao || 'Localização não disponível'}</Text>
            </View>
          </View>
        </View>



        <View style={styles.card}>
          <View style={styles.sectionTitle}>
            <Icon name="security" size={20} color="#1e3d59" />
            <Text style={styles.sectionTitleText}>Permissões do Usuário</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nível de Acesso</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setRoleModalVisible(true)}
            >
              <View style={styles.roleInfo}>
                <Icon name={getRoleIcon(selectedRole)} size={22} color="#1e3d59" />
                <Text style={styles.selectButtonText}>
                  {getRoleName(selectedRole)}
                </Text>
              </View>
              <Icon name="keyboard-arrow-down" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status do Usuário</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusTextContainer}>
                <Icon 
                  name={isActive ? "check-circle" : "cancel"} 
                  size={22} 
                  color={isActive ? "#4CAF50" : "#F44336"}
                  style={styles.statusIcon}
                />
                <Text style={[
                  styles.statusText,
                  isActive ? styles.activeText : styles.inactiveText
                ]}>
                  {isActive ? "Usuário Ativo" : "Usuário Inativo"}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#ffcdd2", true: "#c8e6c9" }}
                thumbColor={isActive ? "#4CAF50" : "#F44336"}
                ios_backgroundColor="#ffcdd2"
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Salvar alterações</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.navigate('ProfessionalsList')}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Icon name="close" size={20} color="#666" style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            onTouchEnd={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Nível de Acesso</Text>
            </View>
            
            <View style={styles.modalContent}>
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
                  <View style={styles.roleOptionContent}>
                    <Icon 
                      name={role.icon} 
                      size={22} 
                      color={selectedRole === role.nivel_acesso ? "#1e3d59" : "#666"} 
                      style={styles.roleIcon}
                    />
                    <Text 
                      style={[
                        styles.roleOptionText,
                        selectedRole === role.nivel_acesso && styles.selectedRoleText
                      ]}
                    >
                      {role.name}
                    </Text>
                  </View>
                  {selectedRole === role.nivel_acesso && (
                    <Icon name="check" size={22} color="#1e3d59" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setRoleModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e3d59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 4,
  },
  profileCpf: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  unitSection: {
    marginTop: 4,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowIcon: {
    marginRight: 12,
  },
  unitText: {
    fontSize: 14,
    color: '#444',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3d59',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    padding: 14,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeText: {
    color: '#388E3C',
  },
  inactiveText: {
    color: '#D32F2F',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#9aa5b1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
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
  },
  modalContent: {
    padding: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    marginRight: 12,
  },
  selectedRoleOption: {
    backgroundColor: 'rgba(30, 61, 89, 0.05)',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRoleText: {
    color: '#1e3d59',
    fontWeight: '600',
  },
  modalCancelButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f5f5f5',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfessionalScreen;