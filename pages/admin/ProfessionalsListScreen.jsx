import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfessionalsListScreen = ({ navigation }) => {
  const professionals = [
    { name: 'Pedro alves', cpf: '152.125.125.22' },
    { name: 'Mariana', cpf: '152.125.125.22' },
    { name: 'Paulo', cpf: '152.125.125.22' },
    { name: 'João', cpf: '152.125.125.22' },
    { name: 'Luzia Maria', cpf: '152.125.125.22' },
  ];

  return (
    <View style={styles.container}>
           <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profissionais</Text>
            </View>


      <View style={styles.content}>
        <View style={styles.unitInfo}>
          <Icon name="business" size={20} color="#1e3d59" />
          <Text style={styles.unitName}>Unidade da Saude 5 Gama </Text>
          <Text style={styles.unitAddress}>Endereço da unidade do saude gama leste</Text>
        </View>

        <Text style={styles.sectionTitle}>Profissionais cadastrados</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar"
            placeholderTextColor="#999"
          />
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>

        <ScrollView>
          {professionals.map((prof, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.professionalCard}
              onPress={() => navigation.navigate('EditProfessional')}
            >
              <View>
                <Text style={styles.professionalName}>{prof.name}</Text>
                <Text style={styles.professionalCpf}>{prof.cpf}</Text>
              </View>
              <Icon name="edit" size={20} color="#1e3d59" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterProfessional')}
        >
          <Text style={styles.addButtonText}>Cadastrar Profissional</Text>
          <Icon name="add" size={24} color="#1e3d59" />
        </TouchableOpacity>
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
    unitInfo: {
      marginBottom: 24,
    },
    unitName: {
      fontSize: 16,
      fontWeight: '500',
      color: '#1e3d59',
      marginTop: 8,
    },
    unitAddress: {
      fontSize: 14,
      color: '#666',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: '#333',
      marginBottom: 16,
    },
    searchContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 12,
      paddingRight: 40,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    searchIcon: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
    professionalCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff',
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    professionalName: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
    },
    professionalCpf: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
      borderWidth: 1,
      borderColor: '#1e3d59',
    },
    addButtonText: {
      color: '#1e3d59',
      fontSize: 16,
      fontWeight: '500',
      marginRight: 8,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      color: '#333',
      marginBottom: 8,
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
  });

  export default ProfessionalsListScreen;