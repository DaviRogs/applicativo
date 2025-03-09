import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ImageBackground, Image, SafeAreaView, StatusBar } from 'react-native';

const InitialScreen = ({navigation}) => {
  const backgroundImage = require('../assets/background.png');
  const logo1 = require('../assets/logo1.png');
  const logo2 = require('../assets/logo2.png');
  const logo3 = require('../assets/logo3.png');

  // useEffect(() => {
  //   const navigateToLogin = () => {
  //     navigation.navigate('Login');
  //   };
  //   navigateToLogin();
  // }, [navigation]); 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <View style={styles.overlay}>
          <View style={styles.logoContainer}>
            <Image source={logo1} style={styles.logo} />
            <Image source={logo2} style={styles.logo} />
            <Image source={logo3} style={styles.logo} />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.startButton}             onPress={() => navigation.navigate('Login')}
>
              <Text style={styles.startButtonText}>Começar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Não possuo cadastro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "flex-end",
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(26, 69, 104, 0.5)',
        justifyContent: 'flex-end',
        paddingVertical: 50,
      },

  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  buttonContainer: {
    paddingHorizontal: 10,
    gap: 2,
  },
  startButton: {
    backgroundColor: '#1A4568',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default InitialScreen;
