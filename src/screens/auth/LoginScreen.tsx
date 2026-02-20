import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
// Cargar Ionicons de forma segura (fallback a emoji si no está instalado)
let Ionicons: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch (e) {
  Ionicons = null;
}
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { login } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const storeLogin = useAuthStore(state => state.login);

  const handleLogin = async () => {
    // clear previous errors
    setErrors({});

    const newErrors: { [k: string]: string } = {};
    if (!email.trim()) newErrors.email = 'Ingrese su correo electrónico';
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = 'Correo inválido';
    }
    if (!password) newErrors.password = 'Ingrese su contraseña';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.email) emailRef.current?.focus();
      else if (newErrors.password) passwordRef.current?.focus();
      return;
    }

    try {
      const data = await login(email, password);
      storeLogin(data.token, data.user);
      setServerError(null);
    } catch (e: any) {
      // show server error near form (general) and keep Alert for visibility
      const msg = e?.message || 'Credenciales inválidas';
      setServerError(msg);
      Alert.alert('Error', msg);
    }
  };

  return (
    <View style={[styles.container, styles.heroBackground, { justifyContent: 'center' }]}> 
      <View style={[styles.cardCentered, { backgroundColor: '#3771a3' }]}> 
        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <Image source={require('../../../assets/municipio.png')} style={{ width: 76, height: 76, marginBottom: 8 }} />
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>MiTurnoMuni</Text>
        </View>

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="mail-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>✉️</Text>
          )}
          <TextInput
            ref={emailRef}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(v) => { setEmail(v); setErrors((s) => { const c = { ...s }; delete c.email; return c; }); }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ flex: 1 }}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>
        {errors.email ? <Text style={{ color: '#ff6b6b', marginLeft: 8, marginTop: 4 }}>{errors.email}</Text> : null}

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="lock-closed-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>🔒</Text>
          )}
          <TextInput
            ref={passwordRef}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((s) => { const c = { ...s }; delete c.password; return c; }); }}
            secureTextEntry
            style={{ flex: 1 }}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>
        {errors.password ? <Text style={{ color: '#ff6b6b', marginLeft: 8, marginTop: 4 }}>{errors.password}</Text> : null}

        {serverError ? (
          <Text style={{ color: '#ffd2d2', marginLeft: 8, marginTop: 10 }}>{serverError}</Text>
        ) : null}

        <TouchableOpacity onPress={handleLogin} style={[styles.primaryButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccd4db' }]}>
          <Text style={[styles.primaryButtonText, { color: '#fff' }]}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register') as any} style={styles.secondaryButtonGreen}>
          <Text style={styles.secondaryButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={{ height: 10 }} />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={{ color: '#cfe6ff', textAlign: 'center' }}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
