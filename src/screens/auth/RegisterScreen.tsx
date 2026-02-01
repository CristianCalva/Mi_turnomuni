import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import { register } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';

export default function RegisterScreen() {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'CIUDADANO' | 'FUNCIONARIO'>('CIUDADANO');
  const storeLogin = useAuthStore(state => state.login);

  const handleRegister = async () => {
    if (!cedula || !nombre || !email || !password) {
      Alert.alert('Validación', 'Complete todos los campos');
      return;
    }

    try {
      const data = await register(cedula, nombre, email, password, rol);
      storeLogin(data.token, data.user);
    } catch (e) {
      Alert.alert('Error', 'Registro fallido');
    }
  };

  return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <View style={{ backgroundColor: colors.white, padding: 20, borderRadius: 12, elevation: 3 }}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Image source={require('../../../assets/icon.png')} style={{ width: 64, height: 64, marginBottom: 8 }} />
          <Text style={styles.headingLarge}>Crear cuenta</Text>
        </View>

        <TextInput placeholder="Cédula" value={cedula} onChangeText={setCedula} style={styles.input} />
        <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

        <Text style={{ marginBottom: 8 }}>Seleccionar rol</Text>
        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          <TouchableOpacity onPress={() => setRol('CIUDADANO')} style={{ marginRight: 10 }}>
            <Text style={{ padding: 8, backgroundColor: rol === 'CIUDADANO' ? colors.primary : '#eee', color: rol === 'CIUDADANO' ? '#fff' : '#000', borderRadius: 6 }}>Ciudadano</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setRol('FUNCIONARIO')}>
            <Text style={{ padding: 8, backgroundColor: rol === 'FUNCIONARIO' ? colors.secondary : '#eee', color: rol === 'FUNCIONARIO' ? '#fff' : '#000', borderRadius: 6 }}>Funcionario</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleRegister} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
