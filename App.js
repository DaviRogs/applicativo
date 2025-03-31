import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store/store';
import { restoreTokens } from './store/authSlice';
import { fetchCurrentUser, selectHasAdminAccess } from './store/userSlice';
import { Linking } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Import screens
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import LoadingScreen from './pages/LoadingScreen';
import CreatePasswordScreen from './pages/CreatePasswordScreen';
import SuccessScreen from './pages/SuccessScreen';
import InitialScreen from './pages/InitialScreen';
import HomeScreen from './pages/user/HomeScreen';
import NovoAtendimentoScreen from './pages/user/NovoAtendimentoScreen';
import NovoPacienteScreen from './pages/user/NovoPacienteScreen';
import EsqueciSenhaScreen from './pages/EsqueciSenhaScreen';
import RedefinirSenhaScreen from './pages/RedefinirSenhaScreen';
import NoRegistrationScreen from './pages/NoRegistrationScreen';

// Admin imports
import HomeAdminScreen from './pages/admin/HomeAdminScreen';
import RegisterProfessionalScreen from './pages/admin/RegisterProfessionalScreen';
import EditProfessionalScreen from './pages/admin/EditProfessionalScreen';
import ProfessionalsListScreen from './pages/admin/ProfessionalsListScreen';

import InjuryListScreen from './pages/user/lesoes/InjuryListScreen';
import AddInjuryScreen from './pages/user/lesoes/AddInjuryScreen';
import { InjuryLocationScreen } from './pages/user/lesoes/InjuryLocationScreen';
import CameraScreen from './pages/user/lesoes/CameraScreen';
import { PhotoPreviewScreen } from './pages/user/lesoes/PhotoPreviewScreen';

// admin unidades import
import HealthUnitListScreen from './pages/unidadeSaude/HealthUnitListScreen'; 
import RegisterHealthUnitScreen from './pages/unidadeSaude/RegisterHealthUnitScreen';
import {EditHealthUnitScreen}  from './pages/unidadeSaude/EditHealthUnitScreen';

//questionario
import QuestoesGeraisSaude from './pages/user/questionario/QuestoesGeraisSaude';
import AvaliacaoFototipo from './pages/user/questionario/AvaliacaoFototipo';
import HistoricoCancer from './pages/user/questionario/HistoricoCancer';
import FatoresRisco from './pages/user/questionario/FatoresRisco';
import InvestigacaoLesoes from './pages/user/questionario/InvestigacaoLesoes';
import ResultadoAnamnese from './pages/user/questionario/ResultadoAnamnese';

//consent
import ConsentTermScreen from './pages/user/consent/ConsentTermScreen';
import SignatureCameraScreen from './pages/user/consent/SignatureCameraScreen';
import SignaturePreviewScreen from './pages/user/consent/SignaturePreviewScreen';

const Stack = createNativeStackNavigator();
const navigationRef = React.createRef(); 

const extractTokenFromURL = (url) => {
  const match = url.match(/[?&]token=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const { loading: userLoading } = useSelector(state => state.user);
  const hasAdminAccess = useSelector(selectHasAdminAccess);
  const initialLinkProcessed = useRef(false);
  const prevAuthState = useRef(isAuthenticated);

  useEffect(() => {
    if (prevAuthState.current !== isAuthenticated) {
      prevAuthState.current = isAuthenticated;
      
      if (navigationRef.current) {
        if (isAuthenticated) {
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: hasAdminAccess ? 'HomeAdmin' : 'Home' }],
            })
          );
        } else {
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'InitialScreen' }],
            })
          );
        }
      }
    }
  }, [isAuthenticated, hasAdminAccess]);

  useEffect(() => {
    const initializeApp = async () => {
      if (!initialLinkProcessed.current) {
        try {
          const tokenResult = await dispatch(restoreTokens());
          if (tokenResult.payload?.accessToken) {
            await dispatch(fetchCurrentUser());
          }
        } catch (error) {
          console.error("Error initializing app:", error);
        }
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
          console.log("Token found in deep link:", token);
          initialLinkProcessed.current = true;
          
          if (url.includes('reset-password') || url.includes('redefinir-senha')) {
            navigationRef.current?.navigate('RedefinirSenha', { token });
          } 
          else {
            navigationRef.current?.navigate('Register', { token });
          }
        }
      }
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  if (authLoading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      initialRouteName={isAuthenticated ? (hasAdminAccess ? 'HomeAdmin' : 'Home') : 'InitialScreen'}
      screenOptions={{ headerShown: false }}
    >
      {/* Auth screens - always available */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="InitialScreen" component={InitialScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
      <Stack.Screen name="RedefinirSenha" component={RedefinirSenhaScreen} />
      <Stack.Screen name="NoRegistration" component={NoRegistrationScreen} />
      
      {/* Admin screens */}
      <Stack.Screen name="HomeAdmin" component={HomeAdminScreen} />
      <Stack.Screen name="RegisterProfessional" component={RegisterProfessionalScreen} />
      <Stack.Screen name="EditProfessional" component={EditProfessionalScreen} />
      <Stack.Screen name="ProfessionalsList" component={ProfessionalsListScreen} />
      <Stack.Screen name="HealthUnitList" component={HealthUnitListScreen} />
      <Stack.Screen name="RegisterHealthUnit" component={RegisterHealthUnitScreen} />
      <Stack.Screen name="EditHealthUnit" component={EditHealthUnitScreen} />
      
      {/* User screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NovoAtendimento" component={NovoAtendimentoScreen} />
      <Stack.Screen name="NovoPaciente" component={NovoPacienteScreen} />
      <Stack.Screen name="InjuryList" component={InjuryListScreen} />
      <Stack.Screen name="AddInjury" component={AddInjuryScreen} />
      <Stack.Screen name="InjuryLocation" component={InjuryLocationScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="PhotoPreview" component={PhotoPreviewScreen} />
      
      {/* Questionario screens */}
      <Stack.Screen name="QuestoesGeraisSaude" component={QuestoesGeraisSaude} />
      <Stack.Screen name="AvaliacaoFototipo" component={AvaliacaoFototipo} />
      <Stack.Screen name="HistoricoCancer" component={HistoricoCancer} />
      <Stack.Screen name="FatoresRisco" component={FatoresRisco} />
      <Stack.Screen name="InvestigacaoLesoes" component={InvestigacaoLesoes} />
      <Stack.Screen name="ResultadoAnamnese" component={ResultadoAnamnese} />

      {/* Consent screens */}
      <Stack.Screen name="ConsentTerm" component={ConsentTermScreen} />
      <Stack.Screen name="SignatureCamera" component={SignatureCameraScreen} />
      <Stack.Screen name="SignaturePreview" component={SignaturePreviewScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  const linking = {
    prefixes: ['dermalert://', 'https://dermalert.example.com'],
    config: {
      screens: {
        InitialScreen: '',
        Register: 'register',
        Login: 'login',
        Home: 'home',
        HomeAdmin: 'admin',
        RedefinirSenha: 'redefinir-senha',
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

export default App;