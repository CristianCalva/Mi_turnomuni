export const login = async (email: string, password: string) => {
  await new Promise((r) => setTimeout(r, 500));

  if (email === 'funcionario@muni.gob.ec') {
    return {
      token: 'mock-token',
      user: {
        id: '99',
        nombre: 'Funcionario Municipal',
        email,
        rol: 'FUNCIONARIO',
      },
    };
  }

  return {
    token: 'mock-token',
    user: {
      id: '1',
      nombre: 'Ciudadano',
      email,
      rol: 'CIUDADANO',
    },
  };
};

export const register = async (
  cedula: string,
  nombre: string,
  email: string,
  password: string,
  rol: 'CIUDADANO' | 'FUNCIONARIO' = 'CIUDADANO'
) => {
  // Simulación de registro en backend
  await new Promise((r) => setTimeout(r, 600));

  // Mock: si rol FUNCIONARIO y email contiene 'muni', asignamos id de funcionario
  const id = rol === 'FUNCIONARIO' ? '99' : String(Math.floor(Math.random() * 1000));

  return {
    token: 'mock-token',
    user: {
      id,
      nombre: nombre || (rol === 'FUNCIONARIO' ? 'Funcionario Municipal' : 'Ciudadano'),
      email,
      rol,
    },
  };
};
