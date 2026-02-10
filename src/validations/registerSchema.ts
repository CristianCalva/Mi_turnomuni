import * as yup from 'yup';

export const registerSchema = yup.object({
  nombre: yup.string().trim().required('Ingrese su nombre completo').min(3, 'Nombre muy corto'),
  cedula: yup.string().trim().required('Ingrese su cédula').matches(/^\d{4,20}$/, 'Cédula inválida'),
  // NOTE: además del formato de correo, se exige aquí una validación específica
  // que el valor contenga letras y números y tenga entre 6 y 8 caracteres.
  // Esto es una regla personalizada solicitada (puede no coincidir con formatos de correo reales).
  email: yup
    .string()
    .trim()
    .required('Ingrese su correo electrónico')
    .email('Correo inválido')
    .test('email-pattern', 'El email debe contener letras y números (6-8 caracteres)', (value) => {
      if (!value) return false;
      // extraer sólo la parte local antes de @ para la comprobación de longitud/caracteres
      const local = value.split('@')[0] || '';
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/.test(local);
    }),
  telefono: yup.string().trim().required('Ingrese su teléfono').min(6, 'Teléfono inválido'),
  password: yup.string().required('Ingrese una contraseña').min(6, 'Mínimo 6 caracteres'),
  confirmPassword: yup.string().required('Confirme su contraseña').oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
});

export type RegisterForm = yup.InferType<typeof registerSchema>;
