import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InjuryListScreen = ({ navigation, route }) => {
  const [injuries, setInjuries] = useState([
    { id: 1, title: 'Braço direito', description: 'Lesão na região do cotovelo', location: 'Braço', photos: [] },
    { id: 2, title: 'Perna esquerda', description: 'Ferimento superficial na coxa', location: 'Coxa', photos: [] },
    { id: 3, title: 'Tórax', description: 'Escoriação na região peitoral', location: 'Tórax', photos: [] },
  ]);
  
  // Update injuries list if new injury was added
  useEffect(() => {
    if (route.params?.newInjury) {
      const newInjury = route.params.newInjury;
      setInjuries(currentInjuries => [
        ...currentInjuries,
        { 
          id: currentInjuries.length + 1, 
          ...newInjury 
        }
      ]);
      // Clear params after using them
      navigation.setParams({ newInjury: undefined });
    }
  }, [route.params?.newInjury]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('NovoPaciente')}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro de lesões</Text>
        </View>

        <ScrollView style={styles.content}>
          {injuries.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="healing" size={48} color="#cccccc" />
              <Text style={styles.emptyStateText}>Nenhuma lesão registrada</Text>
            </View>
          ) : (
            injuries.map((injury) => (
              <TouchableOpacity
                key={injury.id}
                style={styles.injuryCard}
                onPress={() => navigation.navigate('AddInjury', { injury })}
              >
                <View style={styles.injuryContent}>
                  <Text style={styles.injuryLocation}>Local: {injury.location}</Text>
                  <Text style={styles.injuryDescription}>{injury.description}</Text>
                  {injury.photos && injury.photos.length > 0 && (
                    <Text style={styles.photosInfo}>
                      <Icon name="photo" size={14} color="#666" /> {injury.photos.length} {injury.photos.length === 1 ? 'foto' : 'fotos'}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-right" size={20} color="#1e3d59" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddInjury')}
        >
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.floatingButtonText}>Registrar lesão</Text>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  injuryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  injuryContent: {
    flex: 1,
  },
  injuryLocation: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3d59',
    marginBottom: 4,
  },
  injuryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  photosInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1e3d59',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InjuryListScreen;