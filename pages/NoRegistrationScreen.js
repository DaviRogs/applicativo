import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Linking, 
  SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const NoRegistrationScreen = () => {
  const navigation = useNavigation();
  
  const openYoutubeVideo = () => {
    Linking.openURL('https://www.youtube.com/watch?v=ApXoWvfEYVU');
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };


      useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            navigation.navigate('InitialScreen');
            return true; 
          };
      
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
          return () => 
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
      );


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goToLogin} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1e3d59" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Não Possui Cadastro</Text>
        </View>

        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/dermaalert.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
         
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Como obter acesso ao DermAlert?</Text>
          
          <Text style={styles.infoText}>
            O DermAlert é um sistema exclusivo para profissionais de saúde autorizados.
            Para solicitar seu cadastro, entre em contato com:
          </Text>
          
          <View style={styles.contactItem}>
            <Icon name="business" size={22} color="#1e3d59" style={styles.contactIcon} />
            <Text style={styles.contactText}>Assistência DermAlert</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Icon name="email" size={22} color="#1e3d59" style={styles.contactIcon} />
            <Text style={styles.contactText}>dermalert@lappis.com.br</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Icon name="phone" size={22} color="#1e3d59" style={styles.contactIcon} />
            <Text style={styles.contactText}>(12) 3456-7890</Text>
          </View>
          
          <Text style={styles.infoExtraText}>
            Forneça suas credenciais profissionais e informações da unidade de saúde onde atua.
          </Text>
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>Conheça o DermAlert</Text>
          <Text style={styles.videoDescription}>
            Assista ao nosso vídeo introdutório para conhecer as funcionalidades do sistema:
          </Text>
          
          <TouchableOpacity onPress={openYoutubeVideo} style={styles.videoContainer}>
            <Image 
              source={require('../assets/logo1.png')} 
              style={styles.videoThumbnail}
            />
            <View style={styles.playButtonOverlay}>
              <Icon name="play-circle-filled" size={60} color="#f5f5f5" />
            </View>
            <View style={styles.videoTitleContainer}>
              <Text style={styles.videoTitle}>Tutorial DermAlert - Introdução ao Sistema</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalInfoText}>
          dermalert@lappis.com.br | Versão: 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3d59',
    marginLeft: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 180,
    height: 70,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3d59',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoExtraText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    width: 30,
  },
  contactText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  videoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoDescription: {
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
  },
  videoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    height: 180,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#dedede',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoTitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  videoTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  additionalInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  additionalInfoText: {
    fontSize: 12,
    color: '#777',
  },
});

export default NoRegistrationScreen;