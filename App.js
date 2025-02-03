import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './pages/LoginScreen';
import FirstAccessScreen from './pages/FirstScreen';
import VerificationScreen from './pages/VerificationScreen';
import LoadingScreen from './pages/LoadingScreen';
import CreatePasswordScreen from './pages/CreatePasswordScreen';
import SuccessScreen from './pages/SuccessScreen';
import InitialScreen from './pages/InitialScreen';
import RegisterScreen from './pages/RegisterScreen';
import HomeScreen from './pages/HomeScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }} >

          {/* <Stack.Screen name="Home" component={HomeScreen} /> 
          <Stack.Screen name="Register" component={RegisterScreen} /> */}
          <Stack.Screen name="Initial" component={InitialScreen} /> 
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="FirstAccess" component={FirstAccessScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
          <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;