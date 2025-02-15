import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { restoreTokens } from './store/authSlice';
import { fetchCurrentUser, selectHasAdminAccess } from './store/userSlice';
import store from './store/store';


import LoginScreen from './pages/LoginScreen';
import FirstAccessScreen from './pages/FirstScreen';
import VerificationScreen from './pages/VerificationScreen';
import LoadingScreen from './pages/LoadingScreen';
import CreatePasswordScreen from './pages/CreatePasswordScreen';
import SuccessScreen from './pages/SuccessScreen';
import InitialScreen from './pages/InitialScreen';
import RegisterScreen from './pages/RegisterScreen';
import HomeScreen from './pages/HomeScreen';
import NovoAtendimentoScreen from './pages/NovoAtendimendoScree';
import NovoPacienteScreen from './pages/NovoPacienteScreen';
import AnamnesisScreen from './pages/AnamnesisScreen';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const { loading: userLoading } = useSelector(state => state.user);
  const hasAdminAccess = useSelector(selectHasAdminAccess);

  useEffect(() => {
    const initializeApp = async () => {
      const tokenResult = await dispatch(restoreTokens());
      if (tokenResult.payload.accessToken) {
        dispatch(fetchCurrentUser());
      }
    };

    initializeApp();
  }, [dispatch]);

  if (authLoading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="FirstAccess" component={FirstAccessScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
            <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            {hasAdminAccess && (
              <>
                <Stack.Screen name="NovoAtendimento" component={NovoAtendimentoScreen} />
                <Stack.Screen name="NovoPaciente" component={NovoPacienteScreen} />
              </>
            )}
            <Stack.Screen name="Anamnesis" component={AnamnesisScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        <AppContent />
      </SafeAreaView>
    </Provider>
  );
};

export default App;