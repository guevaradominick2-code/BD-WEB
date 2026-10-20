# Our Little Universe

Aplicación privada e interactiva para convertir una celebración de cumpleaños en una experiencia digital: calendario con revelaciones temporizadas, sobres, cartas, recuerdos, misiones, cuentas regresivas y un panel de administración.

La interfaz está lista para probarse con datos ficticios sin Supabase. La autenticación, persistencia, fotografías privadas y reglas de revelación reales se activan al conectar un proyecto de Supabase.

## Qué incluye

- Next.js App Router, React, TypeScript y Tailwind CSS.
- Componentes accesibles con patrones de shadcn/ui y Radix UI.
- Animaciones con Motion y soporte para `prefers-reduced-motion`.
- Experiencia mobile-first con seis áreas: Home, Birthday, Memories, Letters, Gifts y Adventure.
- Panel `/admin` con gestión de eventos, sorpresas, cartas, fotografías, personalización y simulación segura de fechas.
- Autenticación SSR con Supabase y roles `admin` / `girlfriend`.
- Migración PostgreSQL con RLS, índices, constraints, bucket privado y funciones RPC.
- Proyección segura: los datos logísticos, mensajes y cartas bloqueados se eliminan en PostgreSQL antes de llegar al navegador.
- PWA instalable mediante el manifest de Next.js.
- Pruebas de las reglas de autorización temporal.

## Ejecutar la demostración local

Requisitos: Node.js 20.9 o superior y pnpm.

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

En `.env.local`, deja vacías las variables de Supabase y conserva:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

Abre `http://localhost:3000`. Verás accesos separados para la experiencia y el panel. El modo demo se desactiva automáticamente en producción y está señalado en toda la interfaz; no representa autenticación segura ni persistencia real.

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta [la migración inicial](./supabase/migrations/202610190001_initial_schema.sql) desde SQL Editor, o usa `supabase db push` con la CLI vinculada al proyecto.
3. En **Authentication → URL Configuration**, define la URL de Vercel como Site URL y agrega `http://localhost:3000/auth/callback` y la URL equivalente de producción entre los Redirect URLs.
4. En **Authentication → Users**, invita primero tu propia cuenta. No establezcas contraseñas compartidas o incluidas en el código.
5. Después de aceptar la invitación, promueve tu perfil desde SQL Editor usando el UUID exacto de tu usuario:

```sql
update public.profiles
set role = 'admin', display_name = 'Admin'
where id = 'TU-UUID-DE-AUTH-USERS';
```

6. Ejecuta [los datos de ejemplo](./supabase/seed.sql). El script crea una celebración para el primer administrador y agrega las actividades editables del 7, 8 y 13–16 de noviembre de 2026.
7. Invita la cuenta de tu novia desde **Authentication → Users**. El trigger crea su perfil como `girlfriend`; no cambies ese rol.
8. Asocia esa cuenta a la celebración:

```sql
update public.celebrations
set guest_id = 'UUID-DE-LA-CUENTA-INVITADA'
where owner_id = 'TU-UUID-DE-AUTH-USERS';
```

9. Copia la URL y la publishable key desde **Project Settings → API**. No uses ni expongas la `service_role` key.

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_TIMEZONE=America/Costa_Rica
NEXT_PUBLIC_DEMO_MODE=false
```

El bucket `memories` se crea como privado. Las imágenes se entregan mediante URLs firmadas por una hora y las políticas de Storage verifican que el usuario pertenezca a la celebración.

## Administrar la celebración

Inicia sesión con el perfil administrador y abre `/admin`.

- **Events:** crea, edita o elimina actividades. Usa fechas ISO 8601 con offset, por ejemplo `2026-11-08T10:00:00-06:00`.
- **Surprises:** configura el sobre, la pista, el mensaje y `reveal_at`. El mensaje y la imagen no salen de PostgreSQL antes de esa fecha salvo que cambies el estado a `revealed`.
- **Letters:** guarda borradores o programa cartas publicadas. Los borradores nunca aparecen para la invitada.
- **Photos:** sube JPEG, PNG, WebP o AVIF de hasta 8 MB. Se almacenan de forma privada.
- **Personalization:** cambia nombre, mensajes, cumpleaños y zona horaria.
- **Preview:** prueba estados usando una fecha hipotética sin alterar el reloj ni las reglas reales.

Las ubicaciones, reservas y horarios incluidos en los datos iniciales dicen “por confirmar”. Sustitúyelos únicamente cuando quieras revelarlos.

## Cargar fotografías reales

1. Entra a `/admin` y abre **Photos**.
2. Elige una imagen optimizada, añade título, categoría, descripción y nota.
3. La API valida formato y tamaño, sube el archivo al bucket privado y crea el registro de memoria.
4. Verifica la experiencia como invitada. Las imágenes usan lazy loading y formatos optimizados por Next.js.

Para una colección grande, comprime las imágenes a WebP/AVIF antes de subirlas; conserva los originales fuera del proyecto.

## Publicar en Vercel

1. Sube este repositorio a un repositorio Git privado.
2. Importa el repositorio en Vercel como proyecto Next.js.
3. Agrega las variables de entorno de Supabase y define `NEXT_PUBLIC_SITE_URL` con el dominio final.
4. No agregues `NEXT_PUBLIC_DEMO_MODE=true` en producción.
5. Despliega y actualiza Site URL / Redirect URLs en Supabase con el dominio final.
6. Ejecuta una prueba con ambas cuentas: una debe entrar a `/admin`; la invitada debe ser redirigida a `/universe` y no debe poder abrir `/admin`.

Para usar un dominio personalizado, añádelo en **Vercel → Project → Domains** y repite el paso de URLs permitidas en Supabase.

## Verificación local

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Las pruebas de [revelaciones](./tests/reveal.test.ts) comprueban que una invitada no reciba campos secretos antes de la fecha, que la comparación sea independiente de la zona horaria del navegador y que el administrador conserve la vista previa completa.

## Estructura

```text
app/                    rutas, autenticación y APIs protegidas
components/             experiencia, panel y componentes UI
lib/                    datos, autorización, reglas y clientes Supabase
public/placeholders/    ilustraciones temporales claramente identificadas
supabase/migrations/    esquema, RLS, RPCs y Storage privado
supabase/seed.sql       contenido editable de ejemplo
tests/                  pruebas de seguridad temporal
```

## Límites del modo demo

Sin credenciales de Supabase, la aplicación permite recorrer ambos roles en desarrollo. Los formularios del panel actualizan el estado de esa sesión y el deseo se guarda en `localStorage`. En producción no hay acceso demo: se requiere una sesión auténtica, el rol se consulta en el servidor y RLS vuelve a validar cada operación.
