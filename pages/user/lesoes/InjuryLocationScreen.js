import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField } from '../../../store/injurySlice';
import { API_URL } from '@env';

export const InjuryLocationScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  
  const currentLocation = useSelector(state => state.injury.formState.location);
  const currentLocationId = useSelector(state => state.injury.formState.injuryId);
  
  const [selectedLocationName, setSelectedLocationName] = useState(currentLocation || '');
  const [selectedLocationObj, setSelectedLocationObj] = useState(null);
  
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 
      
      const response = await fetch(`${API_URL}/locais-lesao`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const transformedData = data.map(item => ({
        id: item.id,
        name: item.nome
      }));
      
      setLocations(transformedData);
      
      if (currentLocation && currentLocationId) {
        const matchingLocation = transformedData.find(loc => loc.id === currentLocationId);
        if (matchingLocation) {
          setSelectedLocationObj(matchingLocation);
        }
      }
    } catch (err) {
      console.error('Error fetching injury locations:', err);
      
      if (err.name === 'AbortError') {
        setError('Tempo limite excedido. Verifique sua conexão e tente novamente.');
      } else {
        setError('Não foi possível carregar os locais de lesão. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLocations();
  }, []);
  
  useEffect(() => {
    if (currentLocation) {
      setSelectedLocationName(currentLocation);
    }
  }, [currentLocation]);

  const filteredLocations = searchQuery
    ? locations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locations;

  const handleLocationSelect = (location) => {
    setSelectedLocationName(location.name);
    setSelectedLocationObj(location);
  };

  const handleSaveLocation = () => {
    if (selectedLocationObj) {
      dispatch(updateFormField({
        field: 'location',
        value: selectedLocationName,
      }));
      
      dispatch(updateFormField({
        field: 'injuryId',
        value: selectedLocationObj.id,
      }));
      
      navigation.navigate('AddInjury');
    }
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        selectedLocationName === item.name && styles.selectedLocation
      ]}
      onPress={() => handleLocationSelect(item)}
      accessibilityRole="button"
      accessibilityLabel={`Selecionar ${item.name}`}
    >
      <Text style={[
        styles.locationText,
        selectedLocationName === item.name && styles.selectedLocationText
      ]}>
        {item.name}
      </Text>
      {selectedLocationName === item.name && (
        <Icon name="check" size={20} color="#1e3d59" />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
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
          <View style={[styles.content, styles.centerContent]}>
            <ActivityIndicator size="large" color="#1e3d59" />
            <Text style={styles.loadingText}>Carregando locais de lesão...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
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
          <View style={[styles.content, styles.centerContent]}>
            <Icon name="error-outline" size={48} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchLocations}
              accessibilityLabel="Tentar novamente"
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main content (when data is loaded successfully)
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
            !selectedLocationObj && styles.disabledButton
          ]}
          onPress={handleSaveLocation}
          disabled={!selectedLocationObj}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#1e3d59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});