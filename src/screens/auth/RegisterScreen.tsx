import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
// Cargar Ionicons de forma segura (fallback a emoji si no está instalado)
let Ionicons: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch (e) {
  Ionicons = null;
}
import { register, checkEmailExists } from '../../services/authService';
import debounce from '../../utils/debounce';
import { registerSchema } from '../../validations/registerSchema';
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
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const nombreRef = useRef<any>(null);
  const cedulaRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const telefonoRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmRef = useRef<any>(null);

  const handleRegister = async () => {
    setErrors({});

    // validate with Yup schema (centralized rules)
    try {
      await registerSchema.validate({ nombre, cedula, email, telefono, password, confirmPassword }, { abortEarly: false });
    } catch (err: any) {
      const e: { [k: string]: string } = {};
      if (err.inner && Array.isArray(err.inner)) {
        err.inner.forEach((vi: any) => {
          if (vi.path) e[vi.path] = vi.message;
        });
      }
      setErrors(e);
      if (e.nombre) nombreRef.current?.focus();
      else if (e.cedula) cedulaRef.current?.focus();
      else if (e.email) emailRef.current?.focus();
      else if (e.telefono) telefonoRef.current?.focus();
      else if (e.password) passwordRef.current?.focus();
      else if (e.confirmPassword) confirmRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      // async check: email uniqueness
      const exists = await checkEmailExists(email);
      if (exists) {
        setErrors({ email: 'El correo ya está registrado' });
        emailRef.current?.focus();
        setLoading(false);
        return;
      }

      const data = await register(cedula, nombre, email, password, rol, telefono);
      Alert.alert('Éxito', 'Cuenta creada correctamente', [
        { text: 'OK', onPress: () => storeLogin(data.token, data.user) },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Registro fallido');
    } finally {
      setLoading(false);
    }
  };

  // debounce email existence check on user input
  const [checkingEmail, setCheckingEmail] = useState(false);
  const debouncedCheck = React.useRef(
      debounce(async (value: string) => {
        if (!value) return;
        // first: local Yup validation for the email field
        try {
          await registerSchema.validateAt('email', { email: value });
          // remove local email error if any
          setErrors((s) => { const c = { ...s }; delete c.email; return c; });
        } catch (e: any) {
          setErrors((s) => ({ ...s, email: e.message }));
          return; // skip async check if local validation fails
        }

        // then: async uniqueness check
        if (value.indexOf('@') === -1) return;
        setCheckingEmail(true);
        try {
          const exists = await checkEmailExists(value);
          if (exists) setErrors((s) => ({ ...s, email: 'El correo ya está registrado' }));
          else setErrors((s) => { const c = { ...s }; delete c.email; return c; });
        } finally {
          setCheckingEmail(false);
        }
      }, 600)
  ).current;

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
          <TextInput
            ref={nombreRef}
            placeholder="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            style={{ flex: 1 }}
            returnKeyType="next"
            onSubmitEditing={() => cedulaRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>
        {errors.nombre ? <Text style={{ color: '#dc3545', marginLeft: 8, marginTop: 4 }}>{errors.nombre}</Text> : null}

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="id-card-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>🆔</Text>
          )}
          <TextInput
            ref={cedulaRef}
            placeholder="Cédula"
            value={cedula}
            onChangeText={setCedula}
            style={{ flex: 1 }}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>
        {errors.cedula ? <Text style={{ color: '#dc3545', marginLeft: 8, marginTop: 4 }}>{errors.cedula}</Text> : null}

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="mail-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>✉️</Text>
          )}
          <TextInput
            ref={emailRef}
            placeholder="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); debouncedCheck(v); }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ flex: 1 }}
            returnKeyType="next"
            onSubmitEditing={() => telefonoRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>
        {errors.email ? <Text style={{ color: '#dc3545', marginLeft: 8, marginTop: 4 }}>{errors.email}</Text> : null}

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="call-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>📞</Text>
          )}
          <TextInput
            ref={telefonoRef}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            style={{ flex: 1 }}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>
        {errors.telefono ? <Text style={{ color: '#dc3545', marginLeft: 8, marginTop: 4 }}>{errors.telefono}</Text> : null}

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="lock-closed-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>🔒</Text>
          )}
          <TextInput
            ref={passwordRef}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ flex: 1 }}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
        </View>
        {errors.password ? <Text style={{ color: '#dc3545', marginLeft: 8, marginTop: 4 }}>{errors.password}</Text> : null}

        <View style={styles.inputRow}>
          {Ionicons ? (
            <Ionicons name="lock-closed-outline" size={20} color="#8a8a8a" style={{ marginRight: 10 }} />
          ) : (
            <Text style={styles.inputIcon}>🔒</Text>
          )}
          <TextInput
            ref={confirmRef}
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={{ flex: 1 }}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
        </View>
        {errors.confirmPassword ? <Text style={{ color: '#dc3545', marginLeft: 8, marginTop: 4 }}>{errors.confirmPassword}</Text> : null}
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
