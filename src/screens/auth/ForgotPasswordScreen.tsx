import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';
import { recoverRequest, recoverReset } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!email) return Alert.alert('Validación', 'Ingrese su email');
    setLoading(true);
    try {
      const res: any = await recoverRequest(email);
      // En desarrollo backend devuelve el token; mostramos instrucciones y token
      Alert.alert('Token generado', `Token: ${res.token}\nUsalo para restablecer contraseña (siguiente paso).`);
      setToken(res.token);
      setStep('reset');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo generar token');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token || !newPassword) return Alert.alert('Validación', 'Complete token y nueva contraseña');
    setLoading(true);
    try {
      await recoverReset(token, newPassword);
      Alert.alert('Éxito', 'Contraseña restablecida. Inicia sesión.');
      setStep('request');
      setEmail('');
      setToken('');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, justifyContent: 'center' }]}> 
      <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '90%' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Recuperar contraseña</Text>

        {step === 'request' ? (
          <>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
            <TouchableOpacity onPress={handleRequest} style={styles.primaryButton} disabled={loading}>
              <Text style={styles.primaryButtonText}>{loading ? 'Enviando...' : 'Solicitar token'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput placeholder="Token" value={token} onChangeText={setToken} style={styles.input} />
            <TextInput placeholder="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry style={styles.input} />
            <TouchableOpacity onPress={handleReset} style={styles.primaryButton} disabled={loading}>
              <Text style={styles.primaryButtonText}>{loading ? 'Restableciendo...' : 'Restablecer contraseña'}</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </View>
  );
}
