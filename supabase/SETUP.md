# Setup del panel admin (Supabase)

## 1. Proyecto
1. Creá un proyecto en https://supabase.com (plan Free).
2. Abrí **SQL Editor** → New query → pegá todo `schema.sql` → Run.

## 2. Usuario admin
1. **Authentication → Users → Add user** (email + password).
2. Abrí el usuario → **App Metadata** y guardá:

```json
{ "role": "admin" }
```

Sin ese `role`, el login falla a propósito.

## 3. Variables en `.env` (o `.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Las keys están en **Project Settings → API**.  
`service_role` solo para el script de migración (nunca en el cliente).

## 4. Migrar el inventario actual

```bash
node --env-file=.env scripts/migrate-to-supabase.mjs
```

Sube `vehicles.json` + fotos de `public/bucket/images/vehicles/` a Postgres + Storage.

## 5. Usar el panel

```bash
npm run dev
```

Abrí http://localhost:3000/admin

## Notas
- Sin estas variables, el sitio público sigue usando `vehicles.json`.
- Con Supabase configurado, el catálogo público lee Postgres.
- El plan Free pausa el proyecto tras ~7 días sin uso; para producción diaria conviene Pro.
