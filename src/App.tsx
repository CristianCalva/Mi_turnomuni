import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './stores/authStore';
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      {!isAuthenticated ? <AuthNavigator /> : <AppNavigator />}
    </NavigationContainer>
  );
}
