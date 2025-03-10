import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ResultadoAnamnese = () => {
  const navigation = useNavigation();
  const anamnesisData = useSelector(state => state.anamnesis);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anamnese Concluída</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.successCard}>
          <Icon name="check-circle" size={60} color="#1e8e3e" />
          <Text style={styles.successTitle}>Questionário Concluído</Text>
          <Text style={styles.successText}>
            Obrigado por completar o questionário de anamnese. Suas respostas foram salvas com sucesso e 
            serão analisadas pelo nosso time médico.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Próximos Passos</Text>
          <View style={styles.infoItem}>
            <Icon name="event" size={24} color="#1e3d59" />
            <Text style={styles.infoText}>
              Aguarde o contato da nossa equipe para o agendamento da sua consulta dermatológica.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="description" size={24} color="#1e3d59" />
            <Text style={styles.infoText}>
              As informações fornecidas serão utilizadas pelo médico durante sua consulta.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="photo-camera" size={24} color="#1e3d59" />
            <Text style={styles.infoText}>
              Se possível, tire fotos de lesões ou manchas suspeitas para mostrar ao médico.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>Voltar para o início</Text>
        </TouchableOpacity>
      </ScrollView>
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
  successCard: {
    backgroundColor: '#f0f9f4',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  homeButton: {
    backgroundColor: '#1e3d59',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ResultadoAnamnese;