import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../theme/styles';

export default function MessagesScreen() {
  return (
    <View style={[styles.container, { paddingTop: 20 }]}>
      <Text style={styles.headingLarge}>Mensajes</Text>
      <Text style={{ color: '#666' }}>No hay mensajes nuevos</Text>
    </View>
  );
}
