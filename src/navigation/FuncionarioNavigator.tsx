import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FuncionarioHomeScreen from '../screens/funcionario/FuncionarioHomeScreen';
import GestionTurnosScreen from '../screens/funcionario/GestionTurnosScreen';

const Stack = createNativeStackNavigator();

export default function FuncionarioNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FuncionarioHome"
        component={FuncionarioHomeScreen}
        options={{ title: 'Panel Funcionario' }}
      />
      <Stack.Screen
        name="GestionTurnos"
        component={GestionTurnosScreen}
        options={{ title: 'Gestión de Turnos' }}
      />
    </Stack.Navigator>
  );
}
