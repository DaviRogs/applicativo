import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InjuryListScreen = ({ navigation }) => {
  const injuries = [
    { id: 1, title: 'Primeira lesão', description: 'Lorem ipsum dolor sit...' },
    { id: 2, title: 'Segunda lesão', description: 'Lorem ipsum dolor sit...' },
    { id: 3, title: 'Terceira lesão', description: 'Lorem ipsum dolor sit...' },
  ];

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

      <ScrollView style={styles.content}>
        {injuries.map((injury) => (
          <TouchableOpacity
            key={injury.id}
            style={styles.injuryCard}
            onPress={() => navigation.navigate('AddInjury', { injury })}
          >
            <View style={styles.injuryContent}>
              <Text style={styles.injuryTitle}>{injury.title}</Text>
              <Text style={styles.injuryDescription}>{injury.description}</Text>
            </View>
            <Icon name="edit" size={20} color="#1e3d59" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddInjury')}
      >
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.floatingButtonText}>Registrar lesão</Text>
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
  injuryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3d59',
    marginBottom: 4,
  },
  injuryDescription: {
    fontSize: 14,
    color: '#666',
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
  },
  floatingButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InjuryListScreen;