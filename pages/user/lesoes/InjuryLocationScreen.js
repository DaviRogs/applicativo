import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const InjuryLocationScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const locations = [
    { id: 1, name: 'Braço' },
    { id: 2, name: 'Antebraço' },
    { id: 3, name: 'Option 03' },
  ];

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro de lesões</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Text style={styles.label}>Local da lesão</Text>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Digite aqui..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Icon name="search" size={20} color="#666" />
          </View>
        </View>

        <ScrollView style={styles.locationList}>
          {filteredLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationItem,
                selectedLocation === location.name && styles.selectedLocation
              ]}
              onPress={() => setSelectedLocation(location.name)}
            >
              <Text style={styles.locationText}>{location.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.saveButtonText}>Salvar alterações</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1e3d59',
      paddingTop: 48,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    backButton: {
      marginRight: 16,
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
    searchContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingRight: 12,
    },
    searchInput: {
      flex: 1,
      padding: 12,
      fontSize: 16,
      color: '#333',
    },
    locationList: {
      flex: 1,
    },
    locationItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    selectedLocation: {
      backgroundColor: '#f5f5f5',
    },
    locationText: {
      fontSize: 16,
      color: '#333',
    },
    cameraContainer: {
      flex: 1,
      position: 'relative',
    },
    camera: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 20,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    overlayText: {
      color: '#fff',
      fontSize: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 8,
      borderRadius: 4,
    },
    captureButton: {
      position: 'absolute',
      bottom: 30,
      alignSelf: 'center',
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#1e3d59',
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    previewImage: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: '#fff',
    },
    discardButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      marginRight: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#1e3d59',
    },
    discardButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#1e3d59',
    },
    saveButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      marginLeft: 8,
      borderRadius: 8,
      backgroundColor: '#1e3d59',
    },
    saveButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#fff',
    },
  });