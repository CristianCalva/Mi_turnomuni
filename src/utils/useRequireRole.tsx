import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

type Role = string | string[];

/**
 * Hook que obliga a tener uno de los roles requeridos. Redirige si no tiene permiso.
 * @param required rol o lista de roles permitidos
 * @param options.redirectTo ruta a redirigir si no tiene permiso (default: 'Home')
 */
export default function useRequireRole(required: Role, options?: { redirectTo?: string }) {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const allowed = (() => {
      if (!user) return false;
      if (Array.isArray(required)) return required.includes(user.rol);
      return user.rol === required;
    })();

    if (!allowed) {
      // Avisar y redirigir al Home (o login si no autenticado)
      const target = options?.redirectTo ?? (user ? 'Home' : 'Login');
      Alert.alert('Acceso denegado', 'No tienes permiso para ver esta pantalla.');
      // @ts-ignore
      navigation.reset?.({ index: 0, routes: [{ name: target }] });
    }
  }, [user, required, navigation, options]);
}

export function hasRole(required: Role) {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  if (Array.isArray(required)) return required.includes(user.rol);
  return user.rol === required;
}
