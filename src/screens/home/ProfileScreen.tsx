import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';

// safe Ionicons import (used elsewhere)
let Ionicons: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch (e) {
  Ionicons = null;
}
// Onboarding removed
import { styles } from '../../theme/styles';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [telefono, setTelefono] = useState(user?.telefono ?? '');
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const initials = (user?.nombre || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const onSave = () => {
    updateProfile({ nombre, email, telefono });
    setEditing(false);
    Alert.alert('Perfil actualizado');
  };

  const onChangePassword = () => {
    if (newPwd !== confirmPwd) {
      Alert.alert('Las contraseñas no coinciden');
      return;
    }

    // Placeholder: integración con backend pendiente.
    setPwdModalVisible(false);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    Alert.alert('Solicitud enviada', 'Funcionalidad pendiente de integración con backend.');
  };

  const fade = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { padding: 16 }]}> 
      <Animated.View style={[styles.profileCard, { alignItems: 'center', opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}> 
        <View style={styles.profileAvatar}>
          <Text style={{ fontSize: 32, fontWeight: '700' }}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{user?.nombre ?? 'Usuario'}</Text>
        <Text style={{ color: '#666', marginBottom: 8 }}>{user?.email}</Text>

        {!editing ? (
          <View style={{ width: '100%' }}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>Email</Text>
              <Text style={styles.profileInfoValue}>{user?.email ?? '-'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {Ionicons ? <Ionicons name="call-outline" size={16} color="#6b6b6b" style={{ marginRight: 8 }} /> : <Text style={{ marginRight: 8 }}>📞</Text>}
                <Text style={styles.profileInfoLabel}>Teléfono</Text>
              </View>
              <Text style={styles.profileInfoValue}>{user?.telefono ?? '-'}</Text>
            </View>

            <View style={styles.profileActions}>
              <TouchableOpacity onPress={() => setEditing(true)} style={[styles.profileButton, styles.profileButtonPrimary]}>
                <Text style={styles.profileButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setPwdModalVisible(true)} style={[styles.profileButton, styles.profileButtonSecondary, { marginLeft: 8 }]}> 
                <Text style={styles.profileButtonText}>Cambiar contraseña</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => logout()} style={[styles.profileButton, styles.profileButtonSecondary, { marginTop: 12 }]}> 
              <Text style={styles.profileButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: '100%' }}>
            <TextInput
              style={styles.profileField}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
            />
            <TextInput
              style={styles.profileField}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.profileField}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Teléfono"
              keyboardType="phone-pad"
            />

            <View style={styles.profileActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setNombre(user?.nombre ?? '');
                  setEmail(user?.email ?? '');
                  setTelefono(user?.telefono ?? '');
                }}
                style={[styles.profileButton, { backgroundColor: '#ccc' }]}
              >
                <Text style={[styles.profileButtonText, { color: '#333' }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSave} style={[styles.profileButton, styles.profileButtonPrimary]}>
                <Text style={styles.profileButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Modal visible={pwdModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Cambiar contraseña</Text>
            <TextInput
              style={styles.profileField}
              value={currentPwd}
              onChangeText={setCurrentPwd}
              placeholder="Contraseña actual"
              secureTextEntry
            />
            <TextInput
              style={styles.profileField}
              value={newPwd}
              onChangeText={setNewPwd}
              placeholder="Nueva contraseña"
              secureTextEntry
            />
            <TextInput
              style={styles.profileField}
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              placeholder="Confirmar nueva contraseña"
              secureTextEntry
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity onPress={() => setPwdModalVisible(false)} style={[styles.secondaryButtonGreen, { marginRight: 8 }]}>
                <Text style={styles.secondaryButtonText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onChangePassword} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Onboarding modal removed */}
    </ScrollView>
  );
}
