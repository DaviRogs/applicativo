import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  ImageBackground, 
  Image, 
  SafeAreaView, 
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
const InitialScreen = () => {
  const backgroundImage = require('../assets/background.png');
  const logo1 = require('../assets/logo1.png');
  const logo2 = require('../assets/logo2.png');
  const logo3 = require('../assets/logo3.png');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale1 = useRef(new Animated.Value(0.5)).current;
  const logoScale2 = useRef(new Animated.Value(0.5)).current;
  const logoScale3 = useRef(new Animated.Value(0.5)).current;
  const buttonSlideUp = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          return true; 
        };
    
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
        return () => 
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [navigation])
    );

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Animate logos one by one
      Animated.stagger(150, [
        Animated.spring(logoScale1, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale2, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale3, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      
      // Animate buttons
      Animated.timing(buttonSlideUp, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Login');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          blurRadius={3}
        >
          <View style={styles.overlay}>
            <View style={styles.logoContainer}>
              <Animated.View style={{ transform: [{ scale: logoScale1 }] }}>
                <Image source={logo1} style={styles.logo} />
              </Animated.View>
              
              <Animated.View style={{ transform: [{ scale: logoScale2 }] }}>
                <Image source={logo2} style={styles.logo} />
              </Animated.View>
              
              <Animated.View style={{ transform: [{ scale: logoScale3 }] }}>
                <Image source={logo3} style={styles.logo} />
              </Animated.View>
            </View>

            <Animated.View 
              style={[
                styles.buttonContainer,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: buttonSlideUp }] 
                }
              ]}
            >
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  style={styles.startButton} 
                  onPress={animateButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>Começar</Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity 
                style={styles.registerButton}
                activeOpacity={0.7}
              >
                <Text style={styles.registerButtonText}>Não possuo cadastro</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ImageBackground>
      </Animated.View>
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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