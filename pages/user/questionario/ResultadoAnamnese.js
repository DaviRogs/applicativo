import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const ResultadoAnamnese = () => {
  const navigation = useNavigation();
  const anamnesisData = useSelector(state => state.anamnesis);

    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          navigation.navigate('InvestigacaoLesoes');
          return true; // Prevent default behavior
        };
    
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
        return () => 
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [navigation])
    );
  
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
      <Text style={styles.successTitle}>Coleta de Dados Concluída</Text>
      <Text style={styles.successText}>
        As informações foram registradas com sucesso e serão analisadas para aprimorar o atendimento e 
        auxiliar em futuras avaliações médicas.
      </Text>
    </View>

    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>Próximos Passos</Text>
      <View style={styles.infoItem}>
        <Icon name="event" size={24} color="#1e3d59" />
        <Text style={styles.infoText}>
          Os dados coletados serão avaliados e utilizados para melhorar a qualidade do atendimento e 
          acompanhamento dos pacientes.
        </Text>
      </View>
      <View style={styles.infoItem}>
        <Icon name="description" size={24} color="#1e3d59" />
        <Text style={styles.infoText}>
          As informações preenchidas poderão auxiliar profissionais de saúde na tomada de decisões 
          futuras.
        </Text>
      </View>
      <View style={styles.infoItem}>
        <Icon name="photo-camera" size={24} color="#1e3d59" />
        <Text style={styles.infoText}>
          Se possível, registre imagens de lesões ou manchas para contribuir com a avaliação médica e 
          acompanhamento adequado.
        </Text>
      </View>
    </View>

    <TouchableOpacity 
      style={styles.homeButton}
      onPress={() => navigation.navigate('NovoPaciente')}
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