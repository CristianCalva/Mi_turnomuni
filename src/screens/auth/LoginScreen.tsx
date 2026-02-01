import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { login } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const storeLogin = useAuthStore(state => state.login);

  const handleLogin = async () => {
    try {
      const data = await login(email, password);
      storeLogin(data.token, data.user);
    } catch {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <View style={{ backgroundColor: colors.white, padding: 20, borderRadius: 12, elevation: 3 }}>
        <Text style={styles.headingLarge}>Iniciar sesión</Text>

        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

        <TouchableOpacity onPress={handleLogin} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity onPress={() => navigation.navigate('Register') as any}>
          <Text style={{ color: colors.primary, textAlign: 'center' }}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
