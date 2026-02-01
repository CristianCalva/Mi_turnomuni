import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/home/HomeScreen';
import TramitesScreen from '../screens/tramites/TramitesScreen';
import AgendarTurnoScreen from '../screens/tramites/AgendarTurnoScreen';
import MisTurnosScreen from '../screens/turnos/MisTurnosScreen';
import MessagesScreen from '../screens/home/MessagesScreen';
import HelpScreen from '../screens/home/HelpScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tramites" component={TramitesScreen} />
      <Stack.Screen name="AgendarTurno" component={AgendarTurnoScreen} />
      <Stack.Screen name="MisTurnos" component={MisTurnosScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Mensajes' }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Ayuda' }} />
    </Stack.Navigator>
  );
}

