import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../theme/styles';

export default function HelpScreen() {
  return (
    <View style={[styles.container, { paddingTop: 20 }]}>
      <Text style={styles.headingLarge}>Ayuda</Text>
      <Text style={{ color: '#666' }}>Preguntas frecuentes y contacto</Text>
    </View>
  );
}
