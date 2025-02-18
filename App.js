import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { restoreTokens } from './store/authSlice';
import { fetchCurrentUser, selectHasAdminAccess } from './store/userSlice';
import store from './store/store';
import { Linking } from 'react-native';

// Import screens
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import FirstAccessScreen from './pages/FirstScreen';
import VerificationScreen from './pages/VerificationScreen';
import LoadingScreen from './pages/LoadingScreen';
import CreatePasswordScreen from './pages/CreatePasswordScreen';
import SuccessScreen from './pages/SuccessScreen';
import InitialScreen from './pages/InitialScreen';
import HomeScreen from './pages/user/HomeScreen';
import NovoAtendimentoScreen from './pages/user/NovoAtendimendoScreen';
import NovoPacienteScreen from './pages/user/NovoPacienteScreen';
import AnamnesisScreen from './pages/user/AnamnesisScreen';


//admin imports
import HomeAdminScreen from './pages/admin/HomeAdminScreen';
import RegisterProfessionalScreen from './pages/admin/RegisterProfessionalScreen';
import EditProfessionalScreen from './pages/admin/EditProfessionalScreen';
import ProfessionalsListScreen from './pages/admin/ProfessionalsListScreen';

const Stack = createNativeStackNavigator();
const navigationRef = React.createRef(); // Needed for deep linking navigation

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const { loading: userLoading } = useSelector(state => state.user);
  const hasAdminAccess = useSelector(selectHasAdminAccess);
  console.log("hasAdminAccess", hasAdminAccess);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const tokenResult = await dispatch(restoreTokens());
        if (tokenResult.payload?.accessToken) {
          await dispatch(fetchCurrentUser());
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, [dispatch]);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      if (url) {
        const token = extractTokenFromURL(url);
        if (token) {
          console.log("Navigating to Register with token:", token);
          navigationRef.current?.navigate('Register', { token });
        }
      }
    };

    // Check initial deep link
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    // Listen for deep links while the app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const extractTokenFromURL = (url) => {
    const match = url.match(/[?&]token=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  if (authLoading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="FirstAccess" component={FirstAccessScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
          <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
          <Stack.Screen name="InitialScreen" component={InitialScreen} />
        </>
      ) : (
        <>
          {hasAdminAccess && (
            <>
              <Stack.Screen name="HomeAdmin" component={HomeAdminScreen} />
              <Stack.Screen name="RegisterProfessional" component={RegisterProfessionalScreen} />
              <Stack.Screen name="EditProfessional" component={EditProfessionalScreen} />
              <Stack.Screen name="ProfessionalsList" component={ProfessionalsListScreen} />
            </>
          )}
          <Stack.Screen name="Home" component={HomeScreen} />

          <Stack.Screen name="NovoAtendimento" component={NovoAtendimentoScreen} />

          <Stack.Screen name="Anamnesis" component={AnamnesisScreen} />
          <Stack.Screen name="NovoPaciente" component={NovoPacienteScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const AppWrapper = () => {
  const linking = {
    prefixes: ['myapp://', 'https://myapp.com'],
    config: {
      screens: {
        Register: 'register',
        Login: 'login',
        Home: 'home',
      },
    },
  };

  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef} linking={linking}>
          <AppContent />
        </NavigationContainer>
      </SafeAreaView>
    </Provider>
  );
};

export default AppWrapper;
