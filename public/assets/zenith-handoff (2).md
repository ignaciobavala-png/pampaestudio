# Zenith Studio — Handoff Técnico
**Fecha:** Junio 2026  
**Estado:** Maqueta aprobada · Listo para desarrollo

---

## 1. Identidad visual

### Tipografía
**Aktiv Grotesk** (Adobe Font — licencia del cliente requerida)  
Variable de peso: Light · Light Italic · Regular · Bold · versiones Extended

Sustituto web mientras se configura Adobe Fonts:
```css
font-family: 'Hanken Grotesk', -apple-system, sans-serif;
/* Google Fonts fallback — reemplazar por kit Adobe del cliente */
```

### Paleta de colores
| Rol | Pantone | HEX | RGB |
|---|---|---|---|
| Primario / Bordo | 229 C | `#490419` | 108, 2, 67 |
| Secundario / Lila | 2635 C | `#D5C7F7` | 213, 199, 247 |
| Verde oscuro | 2307 C | `#385127` | 122, 127, 18 |
| Verde sage | 4515 C | `#7C8E6E` | 204, 186, 111 |
| Naranja acento | 2025 C | `#F68A3E` | 246, 138, 62 |
| Fondo crema | — | `#FFF7ED` | 255, 247, 237 |

**Uso sugerido:**
- `#490419` bordo → acción primaria (botones, CTA, nav activo)
- `#D5C7F7` lila → fondos suaves, estados hover, badges
- `#FFF7ED` crema → fondo general de la app
- `#7C8E6E` sage → estados disponibles, confirmaciones
- `#F68A3E` naranja → alertas, lista de espera, urgencia

---

## 2. Features implementadas en la maqueta

### App cliente (PWA)
- Funnel de 4 pasos: Pack → Pago → Clases → Reserva
- Selección de pack con precios en ARS
- Sheet de pago: Mercado Pago / tarjeta / transferencia
- Calendario semanal con filtros por disciplina
- Detalle de clase con cupo en tiempo real
- Reserva de lugar o ingreso a lista de espera
- Posición en lista de espera con notificación push
- Confirmación con add-to-calendar (Apple / Google)
- Mi agenda con calendario mensual navegable
- Créditos disponibles por pack
- Cancelación de reserva con devolución de crédito
- Perfil de usuario: datos, pack activo, historial, logout
- Login: Apple / Google / email
- PWA shell: bottom nav, safe-area, theme-color, manifest

### Dashboard admin (PWA)
- Vista Hoy: master/detail de clases del día
- Gestión de cupo con stepper inline
- Lista de espera agrupada por clase con notificación individual/masiva
- Cancelación de clase con motivo y mensaje a alumnas
- Vista semanal: calendario con bloques por tipo
- Gestión de clientes: búsqueda, detalle, historial, cambiar pack
- Alta de clase: formulario completo con horario fijo/flexible y repetición
- KPIs: ocupación, clases, espera, ingresos del mes
- Bottom nav mobile, Escape para cerrar modales

---

## 3. Stack técnico para producción

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Tipografía:** Adobe Fonts (Aktiv Grotesk via kit del cliente)
- **PWA:** next-pwa + service worker

### Backend
- **Base de datos + auth:** Supabase
- **Storage:** Supabase Storage (fotos de perfil)
- **Realtime:** Supabase Realtime (cupo y lista de espera en vivo)

### Pagos
- **Mercado Pago** Checkout Pro (credenciales del cliente)
- Webhooks para confirmar reservas post-pago

### Deploy
- **Vercel Pro** (cuenta del deployer)
- Dominio del cliente apuntado via DNS

---

## 4. Modelo de datos Supabase (esquema base)

```sql
-- Usuarios (extendido de auth.users)
profiles (id, nombre, email, avatar_url, created_at)

-- Packs
packs (id, nombre, descripcion, precio, creditos, tipo)
user_packs (id, user_id, pack_id, creditos_restantes, activo, created_at)

-- Clases
clases (id, nombre, tipo, sala, instructora_id, hora_inicio, hora_fin,
        cupo_max, horario_fijo, dias_semana[], activo)

-- Sesiones (instancias de clase por fecha)
sesiones (id, clase_id, fecha, cupo_max_override, cancelada, motivo_cancelacion)

-- Reservas
reservas (id, user_id, sesion_id, estado, created_at)
-- estado: confirmada | cancelada | asistio | ausente

-- Lista de espera
lista_espera (id, user_id, sesion_id, posicion, notificado, created_at)

-- Instructoras
instructoras (id, nombre, especialidad, avatar_url)
```

### Trigger clave (lista de espera automática)
```sql
-- Al cancelar una reserva → notificar al #1 en espera
CREATE FUNCTION notify_waitlist() RETURNS trigger AS $$
BEGIN
  IF NEW.estado = 'cancelada' THEN
    -- Edge Function: enviar push al primer usuario en lista_espera
    PERFORM net.http_post('https://<project>.supabase.co/functions/v1/notify-waitlist',
      json_build_object('sesion_id', NEW.sesion_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Estructura de deploy

```
Cliente crea:
  ✓ Cuenta Supabase (mail propio)
  ✓ Credenciales Mercado Pago (cuenta propia)
  ✓ Kit Adobe Fonts (licencia propia)
  ✓ Dominio

Deployer configura:
  ✓ Vercel Pro (cuenta propia)
  ✓ Variables de entorno en Vercel:
      NEXT_PUBLIC_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY
      SUPABASE_SERVICE_ROLE_KEY
      MP_ACCESS_TOKEN
      ADOBE_FONTS_KIT_ID
  ✓ DNS del dominio del cliente → Vercel
  ✓ Webhook Mercado Pago → /api/webhooks/mp
```

---

## 6. Estimación de tiempo de desarrollo

| Módulo | Tiempo estimado |
|---|---|
| Setup Next.js + Supabase + auth | 1 día |
| Aplicar paleta de marca + tipografía | 0.5 días |
| App cliente completa (funnel + agenda) | 4 días |
| Integración Mercado Pago | 1 día |
| Dashboard admin completo | 3 días |
| Realtime (cupo + lista espera) | 1 día |
| PWA (service worker + manifest) | 0.5 días |
| Testing + deploy + DNS | 1 día |
| **Total estimado** | **~12 días hábiles** |

---

*Documento generado post-aprobación de maqueta — Junio 2026*
