import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
// Cargar Ionicons de forma segura (fallback a emoji si no está instalado)
let Ionicons: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch (e) {
  Ionicons = null;
}
import { register } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';

export default function RegisterScreen() {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<'CIUDADANO' | 'FUNCIONARIO'>('CIUDADANO');
  const storeLogin = useAuthStore(state => state.login);

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!cedula || !nombre || !email || !telefono || !password || !confirmPassword) {
      Alert.alert('Validación', 'Complete todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validación', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const data = await register(cedula, nombre, email, password, rol, telefono);
      storeLogin(data.token, data.user);
      Alert.alert('Éxito', 'Cuenta creada correctamente');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Registro fallido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, styles.heroBackground, { justifyContent: 'center' }]}> 
      <View style={[styles.cardCentered, { backgroundColor: '#3771a3' }]}> 
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Image source={require('../../../assets/registro.png')} style={{ width: 64, height: 64, marginBottom: 8 }} />
          <Text style={[styles.headingLarge, { color: '#fff' }]}>Crear Cuenta</Text>
        </View>

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="person-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>👤</Text>
          )}
          <TextInput placeholder="Nombre completo" value={nombre} onChangeText={setNombre} style={{ flex: 1 }} />
        </View>

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="id-card-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>🆔</Text>
          )}
          <TextInput placeholder="Cédula" value={cedula} onChangeText={setCedula} style={{ flex: 1 }} />
        </View>

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="mail-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>✉️</Text>
          )}
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ flex: 1 }} />
        </View>

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="call-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>📞</Text>
          )}
          <TextInput placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" style={{ flex: 1 }} />
        </View>

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="lock-closed-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>🔒</Text>
          )}
          <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} style={{ flex: 1 }} />
        </View>

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="lock-closed-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>🔒</Text>
          )}
          <TextInput placeholder="Confirmar contraseña" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={{ flex: 1 }} />
        </View>

        <Text style={{ marginTop: 6, marginBottom: 6 }}>Tipo de usuario</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setRol('CIUDADANO')} style={{ marginRight: 10 }}>
            <Text style={{ paddingVertical: 8, paddingHorizontal: 14, backgroundColor: rol === 'CIUDADANO' ? colors.primary : '#eee', color: rol === 'CIUDADANO' ? '#fff' : '#000', borderRadius: 20 }}>Ciudadano</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setRol('FUNCIONARIO')}>
            <Text style={{ paddingVertical: 8, paddingHorizontal: 14, backgroundColor: rol === 'FUNCIONARIO' ? colors.secondary : '#eee', color: rol === 'FUNCIONARIO' ? '#fff' : '#000', borderRadius: 20 }}>Funcionario</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleRegister} style={styles.secondaryButtonGreen} disabled={loading}>
          <Text style={styles.secondaryButtonText}>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
