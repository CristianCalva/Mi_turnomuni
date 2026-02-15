import * as yup from 'yup';

export const registerSchema = yup.object({
  nombre: yup.string().trim().required('Ingrese su nombre completo').min(3, 'Nombre muy corto'),
  cedula: yup.string().trim().required('Ingrese su cédula').matches(/^\d{4,20}$/, 'Cédula inválida'),
  email: yup
    .string()
    .trim()
    .required('Ingrese su correo electrónico')
    .email('Correo inválido')
    .test('email-pattern', 'La parte local del email debe contener letras y números', (value) => {
      if (!value) return false;
      // extraer sólo la parte local antes de @ para la comprobación de que contenga letras y números
      const local = value.split('@')[0] || '';
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(local);
    }),
  telefono: yup.string().trim().required('Ingrese su teléfono').min(6, 'Teléfono inválido'),
  password: yup.string().required('Ingrese una contraseña').min(6, 'Mínimo 6 caracteres'),
  confirmPassword: yup.string().required('Confirme su contraseña').oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
});

export type RegisterForm = yup.InferType<typeof registerSchema>;
