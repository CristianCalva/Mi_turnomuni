# MiTurnoMuni — Desarrollo local

Resumen rápido para desarrollo y pruebas con Expo + backend local.

1. Backend
- Copia `c:\Mi_turnomuni_backend\.env.example` a `.env` y ajusta las credenciales de PostgreSQL.
- Levanta el backend:

```powershell
cd C:\Mi_turnomuni_backend
npm install
npm run dev
```

2. Frontend (Expo)
- Si pruebas en emulador Android/iOS con `expo start` y la app en el mismo ordenador, la detección automática suele funcionar.
- Si usas Expo Go en un dispositivo físico, cambia `API_URL` en `c:\Mi_TurnoMuni\.env` o en `src/services/api.ts` al host de tu PC (ej: `http://192.168.1.42:3000`).

3. Variables de entorno
- Frontend: `c:\Mi_TurnoMuni\.env.example` contiene `API_URL` de ejemplo.
- Backend: `c:\Mi_turnomuni_backend\.env.example` contiene las variables necesarias.

4. Migraciones
- El backend incluye migraciones con Knex en `migrations/` y scripts npm: `npm run migrate:latest`.

5. Consejos
- Para desarrollo con Expo Go en un dispositivo físico, consigue la IP local de tu PC con `ipconfig` y configura `API_URL`.
- No subas `.env` a repositorios públicos; usa `.env.example` para compartir ejemplos.

Si quieres, implemento la detección aún más robusta o agrego scripts para crear `.env` automáticamente.