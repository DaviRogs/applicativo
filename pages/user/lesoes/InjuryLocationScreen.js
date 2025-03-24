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
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField } from '../../../store/injurySlice';
import { API_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

export const InjuryLocationScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
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
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AddInjury');
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );
  
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
    Keyboard.dismiss();
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

  const renderLocationItem = ({ item }) => {
    const isSelected = selectedLocationName === item.name;
    
    return (
      <TouchableOpacity
        style={[
          styles.locationItem,
          isSelected && styles.selectedLocation
        ]}
        onPress={() => handleLocationSelect(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Selecionar ${item.name}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={[
          styles.locationText,
          isSelected && styles.selectedLocationText
        ]}>
          {item.name}
        </Text>
        
        {isSelected && (
          <View style={styles.checkIconContainer}>
            <Icon name="check-circle" size={22} color="#1e3d59" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('AddInjury')}
              accessibilityLabel="Voltar"
              activeOpacity={0.7}
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
        <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('AddInjury')}
              accessibilityLabel="Voltar"
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Local da lesão</Text>
          </View>
          <View style={[styles.content, styles.centerContent]}>
            <Icon name="error-outline" size={48} color="#e74c3c" />
            <Text style={styles.errorTitle}>Falha na conexão</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchLocations}
              accessibilityLabel="Tentar novamente"
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('AddInjury')}
            accessibilityLabel="Voltar"
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Local da lesão</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Text style={styles.label}>Selecione o local da lesão</Text>
            <View style={[
              styles.searchInputContainer,
              searchQuery.length > 0 && styles.activeSearchInputContainer
            ]}>
              <Icon name="search" size={20} color={searchQuery.length > 0 ? "#1e3d59" : "#999"} style={styles.searchIcon} />
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
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filteredLocations}
            keyExtractor={item => item.id.toString()}
            renderItem={renderLocationItem}
            style={styles.locationList}
            contentContainerStyle={[
              styles.listContentContainer,
              filteredLocations.length === 0 && styles.emptyList
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.noResultsContainer}>
                <Icon name="search-off" size={48} color="#999" />
                <Text style={styles.noResultsText}>
                  Nenhum local encontrado para "{searchQuery}"
                </Text>
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchText}>Limpar busca</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {!keyboardVisible && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                !selectedLocationObj && styles.disabledButton
              ]}
              onPress={handleSaveLocation}
              disabled={!selectedLocationObj}
              accessibilityLabel="Confirmar seleção"
              accessibilityRole="button"
              activeOpacity={selectedLocationObj ? 0.8 : 1}
            >
              <Text style={styles.saveButtonText}>
                {selectedLocationObj ? 'Confirmar seleção' : 'Selecione um local'}
              </Text>
              {selectedLocationObj && (
                <Icon name="check" size={20} color="#fff" style={styles.saveButtonIcon} />
              )}
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#f7f9fc',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
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
    marginBottom: 10,
    fontWeight: '600',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeSearchInputContainer: {
    borderColor: '#1e3d59',
    backgroundColor: '#f5f8ff',
  },
  searchIcon: {
    marginLeft: 14,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 10,
    marginRight: 4,
  },
  locationList: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  clearSearchButton: {
    backgroundColor: '#e8edf3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  clearSearchText: {
    color: '#1e3d59',
    fontWeight: '600',
    fontSize: 14,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e8edf3',
  },
  selectedLocation: {
    backgroundColor: '#f5f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1e3d59',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLocationText: {
    fontWeight: '600',
    color: '#1e3d59',
  },
  checkIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8edf3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonIcon: {
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#b7b7b7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});