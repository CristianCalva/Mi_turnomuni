import { NavigationProp } from '@react-navigation/native';

export function navigateOrAuth(
  navigation: NavigationProp<any>,
  isAuthenticated: boolean,
  routeName: string,
  params?: any
) {
  if (isAuthenticated) {
    // Si la ruta objetivo es una pantalla anidada dentro del stack de Inicio,
    // navegar al tab `Inicio` y especificar la pantalla interna.
    if (routeName === 'AgendarTurno') {
      // navegar al tab Tramites que contiene la pantalla AgendarTurno
      navigation.navigate('Tramites' as any, { screen: 'AgendarTurno', params } as any);
      return;
    }

    navigation.navigate(routeName as any, params as any);
  } else {
    // Si no está autenticado, navegar a Login (sin manejo avanzado de redirect por ahora)
    navigation.navigate('Login' as any, { redirectTo: { name: routeName, params } });
  }
}
