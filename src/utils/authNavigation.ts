import { NavigationProp } from '@react-navigation/native';

export function navigateOrAuth(
  navigation: NavigationProp<any>,
  isAuthenticated: boolean,
  routeName: string,
  params?: any
) {
  if (isAuthenticated) {
    navigation.navigate(routeName as any, params as any);
  } else {
    // Si no está autenticado, llevar a Login antes de ir a la ruta solicitada
    navigation.navigate('Login' as any, { redirectTo: { name: routeName, params } });
  }
}
