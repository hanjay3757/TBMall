import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#000',
      }}
    >
      <Stack.Screen name="로그인" component={LoginScreen} />
      <Stack.Screen name="회원가입" component={SignupScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 