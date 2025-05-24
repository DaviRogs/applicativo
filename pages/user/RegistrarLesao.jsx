import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';

const InjuryRegistrationScreen = ({ navigation }) => {
  const [injuries, setInjuries] = useState([]);

  const addNewInjury = () => {
    navigation.navigate('AddInjury', {
      onSave: (injury) => {
        setInjuries([...injuries, injury]);
      },
    });
  };

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
        {injuries.map((injury, index) => (
          <TouchableOpacity
            key={index}
            style={styles.injuryCard}
            onPress={() => navigation.navigate('EditInjury', { injury, index })}
          >
            <View style={styles.injuryInfo}>
              <Text style={styles.injuryTitle}>Lesão {index + 1}</Text>
              <Text style={styles.injuryLocation}>{injury.location}</Text>
              <Text style={styles.injuryDescription}>{injury.description}</Text>
            </View>
            <Icon name="edit" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={addNewInjury}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const AddInjuryScreen = ({ route, navigation }) => {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);

  const handleTakePhoto = () => {
    ImagePicker.launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (!response.didCancel && !response.error) {
          setPhotos([...photos, response]);
        }
      },
    );
  };

  const handleSave = () => {
    const injury = {
      location,
      description,
      photos,
    };
    route.params?.onSave(injury);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro de lesão</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Local da lesão</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Digite aqui..."
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Digite a descrição..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.label}>Fotos</Text>
          <ScrollView horizontal style={styles.photoList}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photoThumbnail}
                />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => {
                    const newPhotos = [...photos];
                    newPhotos.splice(index, 1);
                    setPhotos(newPhotos);
                  }}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleTakePhoto}
            >
              <Icon name="camera-alt" size={24} color="#666" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
    paddingTop: 26,
    height: 90,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  injuryInfo: {
    flex: 1,
  },
  injuryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  injuryLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  photoContainer: {
    marginRight: 8,
    position: 'relative',
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export { InjuryRegistrationScreen, AddInjuryScreen };
