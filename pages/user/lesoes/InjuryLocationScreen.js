import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const InjuryLocationScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Load current location if editing
  useEffect(() => {
    if (route.params?.currentLocation) {
      setSelectedLocation(route.params.currentLocation);
    }
  }, [route.params?.currentLocation]);

  // Comprehensive list of body locations
  const allLocations = [
    { id: 1, name: 'Cabeça' },
    { id: 2, name: 'Face' },
    { id: 3, name: 'Pescoço' },
    { id: 4, name: 'Ombro direito' },
    { id: 5, name: 'Ombro esquerdo' },
    { id: 6, name: 'Braço direito' },
    { id: 7, name: 'Braço esquerdo' },
    { id: 8, name: 'Cotovelo direito' },
    { id: 9, name: 'Cotovelo esquerdo' },
    { id: 10, name: 'Antebraço direito' },
    { id: 11, name: 'Antebraço esquerdo' },
    { id: 12, name: 'Punho direito' },
    { id: 13, name: 'Punho esquerdo' },
    { id: 14, name: 'Mão direita' },
    { id: 15, name: 'Mão esquerda' },
    { id: 16, name: 'Tórax' },
    { id: 17, name: 'Abdômen' },
    { id: 18, name: 'Lombar' },
    { id: 19, name: 'Pélvis' },
    { id: 20, name: 'Quadril direito' },
    { id: 21, name: 'Quadril esquerdo' },
    { id: 22, name: 'Coxa direita' },
    { id: 23, name: 'Coxa esquerda' },
    { id: 24, name: 'Joelho direito' },
    { id: 25, name: 'Joelho esquerdo' },
    { id: 26, name: 'Perna direita' },
    { id: 27, name: 'Perna esquerda' },
    { id: 28, name: 'Tornozelo direito' },
    { id: 29, name: 'Tornozelo esquerdo' },
    { id: 30, name: 'Pé direito' },
    { id: 31, name: 'Pé esquerdo' },
  ];

  // Filter locations based on search query
  const filteredLocations = searchQuery
    ? allLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allLocations;

  // Save selected location and navigate back
  const handleSaveLocation = () => {
    if (selectedLocation) {
      navigation.navigate('AddInjury', { selectedLocation });
    }
  };

  // Render each location item
  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        selectedLocation === item.name && styles.selectedLocation
      ]}
      onPress={() => setSelectedLocation(item.name)}
      accessibilityRole="button"
      accessibilityLabel={`Selecionar ${item.name}`}
    >
      <Text style={[
        styles.locationText,
        selectedLocation === item.name && styles.selectedLocationText
      ]}>
        {item.name}
      </Text>
      {selectedLocation === item.name && (
        <Icon name="check" size={20} color="#1e3d59" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar"
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Local da lesão</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Text style={styles.label}>Selecione o local da lesão</Text>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Busque por um local específico..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCapitalize="none"
              />
              {searchQuery !== '' && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  accessibilityLabel="Limpar busca"
                >
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filteredLocations}
            keyExtractor={item => item.id.toString()}
            renderItem={renderLocationItem}
            style={styles.locationList}
            contentContainerStyle={filteredLocations.length === 0 && styles.emptyList}
            ListEmptyComponent={() => (
              <Text style={styles.noResultsText}>
                Nenhum local encontrado para "{searchQuery}"
              </Text>
            )}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton,
            !selectedLocation && styles.disabledButton
          ]}
          onPress={handleSaveLocation}
          disabled={!selectedLocation}
          accessibilityLabel="Salvar local selecionado"
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 90 : 80,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
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
    fontWeight: '500',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 12,
  },
  locationList: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLocation: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1e3d59',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLocationText: {
    fontWeight: '500',
    color: '#1e3d59',
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});