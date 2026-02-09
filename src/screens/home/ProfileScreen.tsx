import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
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

  return (
    <ScrollView contentContainerStyle={[styles.container, { padding: 16 }]}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={styles.profileAvatar}>
          <Text style={{ fontSize: 32, fontWeight: '700' }}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{user?.nombre ?? 'Usuario'}</Text>
        <Text style={{ color: '#666', marginBottom: 12 }}>{user?.email}</Text>
      </View>

      {editing ? (
        <View>
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

          <TouchableOpacity
            onPress={() => {
              setEditing(false);
              setNombre(user?.nombre ?? '');
              setEmail(user?.email ?? '');
              setTelefono(user?.telefono ?? '');
            }}
            style={styles.secondaryButtonGreen}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSave} style={[styles.primaryButton, { marginTop: 12 }]}>
            <Text style={styles.primaryButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: '700' }}>Nombre</Text>
            <Text style={{ marginBottom: 8 }}>{user?.nombre ?? '-'}</Text>
            <Text style={{ fontWeight: '700' }}>Email</Text>
            <Text style={{ marginBottom: 8 }}>{user?.email ?? '-'}</Text>
            <Text style={{ fontWeight: '700' }}>Teléfono</Text>
            <Text style={{ marginBottom: 8 }}>{user?.telefono ?? '-'}</Text>
          </View>

          <TouchableOpacity onPress={() => setEditing(true)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPwdModalVisible(true)} style={[styles.secondaryButtonGreen, { marginTop: 8 }]}>
            <Text style={styles.secondaryButtonText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => logout()} style={[styles.secondaryButtonGreen, { marginTop: 12 }]}>
            <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}

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
    </ScrollView>
  );
}
