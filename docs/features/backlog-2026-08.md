# Backlog — reunión con Violeta (18-ago-2026)

Features pedidas por la dueña. Estado auditado contra el código y contra la base de
producción el 18-ago-2026.

Leyenda: ❌ no existe · ⚠️ parcial / placeholder · ✅ hecho

---

## 1. Editor y creador de packs en el dashboard ❌

**Pedido:** poder crear, editar y borrar packs desde `/admin`, incluido el precio.

**Estado:** no existe ninguna pantalla de packs. `fetchPacks()`
(`src/app/admin/clientes/actions.ts:131`) solo lee packs para poder asignarlos a una
alumna. No hay `insert`/`update`/`delete` de `packs` en toda la app.

**Dato crítico:** la tabla `packs` en producción tiene **0 filas**. La home
(`src/app/page.tsx:134`) muestra "No hay packs disponibles por ahora". Sin esta
pantalla, el estudio no tiene forma de cargar su oferta.

**Notas de schema:** `packs.price` es `integer` en **centavos** ($28.000 → 2800000).
`period` está limitado por CHECK a `'monthly' | 'per_class'`.

---

## 2. Asociar clases a packs ❌

**Pedido:** que un pack habilite un conjunto determinado de clases.

**Estado:** no hay relación pack ↔ clase en ningún lado. Hoy `book_spot()` toma
*cualquier* pack activo con créditos (`order by created_at desc limit 1`) sin mirar de
qué clase se trata. Es decir: cualquier crédito sirve para cualquier clase.

**Impacto:** requiere tabla nueva (`pack_class_templates`) **y** modificar `book_spot()`
para que elija un pack válido para esa clase concreta.

---

## 3. Clases sueltas ❌

**Pedido:** que existan clases sueltas además de las de pack.

**Estado:** `packs.period` admite `'per_class'` pero nada en el flujo lo trata distinto:
un pack de 1 crédito y uno de 12 se comportan igual. No existe compra de clase suelta.

**Definición (confirmada 18-ago-2026):** una clase suelta es una clase que **no está
dentro de ningún pack**. O sea: se define por pertenencia, no por recurrencia. Una vez
que exista la relación pack ↔ clase (#2), "suelta" es simplemente una `class_template`
sin ninguna fila en esa tabla — no hace falta un flag aparte.

Queda pendiente cómo se cobra y se reserva: ver decisión 1 en "Decisiones abiertas".

---

## 4. Teléfonos internacionales (+54 9, otros países) ⚠️

**Pedido:** que el formulario acepte `+54 9 …` y números de otros países.

**Estado:** roto en el checkout, sin validar en el admin.
- `src/app/pago/page.tsx:108` — `e.target.value.replace(/\D/g, "")` **borra el `+`** y
  todo separador mientras la persona tipea. Es la causa directa del problema.
- `src/app/pago/page.tsx:27` — valida solo `length >= 8`.
- `src/components/admin/add-client-modal.tsx:150` — no filtra pero tampoco normaliza.
- DB: `profiles.phone` es `text` nullable sin constraint → acepta cualquier cosa.

**Fix:** guardar en E.164 (`+5491112345678`), input con prefijo de país y máscara que
no destruya el `+`.

---

## 5. Cobro en efectivo / carga manual de créditos ❌

**Pedido:** que la secretaría pueda cargar créditos a una alumna que pagó en efectivo en
el local, dejando registrado que pagó en efectivo.

**Estado:** existe `assignPack(userId, packId)`
(`src/app/admin/clientes/actions.ts:167`), que asigna un pack y expira los anteriores —
pero **no registra ningún pago**: ni monto, ni método, ni quién lo cobró, ni cuándo.
No existe tabla de pagos.

**Efecto secundario:** `fetchMonthlyRevenue()` (línea 283) estima los ingresos del mes
sumando el precio de los packs asignados. Es un proxy, no plata real: si Violeta regala
un pack o cobra un precio distinto, el número miente.

---

## 6. Sección "Pagos" / configuración bancaria ❌

**Pedido:** cargar alias, CBU y datos bancarios desde el panel.

**Estado:** el CBU está **hardcodeado** en `src/app/pago/page.tsx:148` con
`0000 0000 0000 0000 0000 00`. No hay tabla de settings ni pantalla de configuración.

---

## 7. Generador de descuentos ❌

**Pedido:** poder taguear a un usuario o a un pack y aplicarle un descuento configurable.

**Estado:** no existe nada — ni tags, ni descuentos, ni cupones. Es la feature más
grande de la lista y la que más depende de decisiones de negocio.

---

## 8. Sacar Yoga (el estudio es solo Pilates) ❌

**Estado:** "Yoga" está hardcodeado en 8 lugares del código **y** en un CHECK constraint
de la base:

| Lugar | Qué es |
|---|---|
| `class_templates.discipline` (DB) | `check (discipline in ('Yoga','Pilates'))` |
| `src/app/admin/nueva-clase/page.tsx:22,95` | toggle Yoga/Pilates (default **Yoga**) |
| `src/app/admin/nueva-clase/actions.ts:10` | tipo del server action |
| `src/app/clases/page.tsx:54` | filtro `["todos","Yoga","Pilates"]` |
| `src/app/clases/[id]/page.tsx:16` | copy descriptivo por disciplina |
| `src/app/admin/actions.ts:11,135` · `semana/actions.ts:11,65` · `admin-types.ts:4` · `week-calendar.tsx:7` | tipos y colores |
| `src/app/layout.tsx:25,27` | título y meta description del sitio |

**Dato de producción:** hay **7 templates de Yoga** cargados (contra 5 de Pilates), con
264 bookings totales colgando de todo eso. Son datos de demo, pero hay que decidir si se
borran o se archivan (`is_active = false`) antes de tocar el constraint.

---

## 9. Instructores cargables ❌

**Pedido:** dar de alta profesores en vez de tenerlos hardcodeados.

**Estado:** hardcodeados y **duplicados con distinto texto**:
- `src/app/admin/nueva-clase/page.tsx:7` → `["Valeria Martínez", "Sofía Rodríguez", "Camila López"]`
- `src/components/admin/new-class-form.tsx:10` → los mismos **sin tildes**

En la DB `class_templates.teacher` es `text` libre, así que hoy se guarda el string tal
cual y una tilde distinta crea "otro" profesor.

**Nota:** `room` tiene el mismo problema y encima con CHECK constraint
(`'Sala 1' | 'Sala 2' | 'Reformer'`). Conviene resolver ambos juntos.

**Bonus de limpieza:** `src/components/admin/new-class-form.tsx` (185 líneas) es
**código muerto** — ningún archivo lo importa; la página real tiene su propio
formulario. Borrarlo evita seguir arrastrando dos fuentes de verdad.

---

## 10. Clases de 50 minutos, grilla cada 50 min ❌

**Pedido:** duración por defecto de 50 minutos; que la grilla horaria corte cada 50 min.

**Estado:** el formulario arranca en 09:00 → 10:15 (**75 minutos**) y la hora de fin se
carga a mano, sin ninguna relación con la de inicio
(`src/app/admin/nueva-clase/page.tsx:27-28`). La DB solo valida `time_end > time_start`.

---

## 11. La app no está en hora de Buenos Aires ⚠️

**Estado:** el bug de fecha del lado del navegador ya está resuelto — `toLocalDateStr()`
(`src/lib/utils.ts`) existe justamente para eso, y todas las páginas son
`"use client"`, así que "hoy" sale del reloj de la alumna. Lo que **sigue en UTC** es
todo lo que corre en el servidor:

| Lugar | Problema |
|---|---|
| `clientes/actions.ts:287` | `fetchMonthlyRevenue` corta el mes con el reloj del server (UTC) → los primeros/últimos días caen en el mes equivocado |
| `clientes/actions.ts:186-198` | `assignPack` calcula `starts_at`/`expires_at` desde el `new Date()` del server |
| `vercel.json` | crons en UTC: `pack-alerts` a las 12:00 UTC = **09:00 AR**, `keep-alive` 09:00 UTC = 06:00 AR |
| `run_pack_alerts()` (SQL) | compara con `now()` (UTC); solo formatea a AR para el texto del aviso |

**Falta un dato:** necesito que me digas **en qué pantalla** viste la hora corrida, para
saber si es esto o algo más puntual.

---

## 12. Checkbox "se repite todas las semanas" ⚠️

**Pedido:** al crear una clase (o un pack), poder marcar si es única o semanal.

**Estado:** hoy es al revés de lo que hace falta — `class_templates` es
*inherentemente* recurrente (guarda `day_of_week`, no una fecha), así que **toda clase
se repite todas las semanas para siempre** y no hay forma de crear una clase única.

El `<select> "Se repite"` con opciones "Todos los días / Lunes y Miércoles / …" que se ve
en `new-class-form.tsx:11-17` es un **placeholder muerto**: no está conectado a nada y el
componente entero está sin usar (ver punto 9).

Existe `book_recurring(template_id, start_date, weeks)` en la DB, pero es del lado de la
alumna (reservar N semanas seguidas), no de la creación de la clase.

**Sobre "pack que se repite":** para packs no me cierra qué significa. Ver decisiones
abiertas.

---

# Decisiones abiertas (para confirmar con Violeta)

1. ~~**"Clases sueltas"**~~ — **resuelto 18-ago-2026**: es una clase que no pertenece a
   ningún pack, y lleva **su propio precio**. La alumna la paga individual, sin
   necesitar un pack activo.

2. ~~**Alcance de los packs**~~ — **resuelto 18-ago-2026**: el pack se arma **por tipo
   de clase** (Reformer, Mat, etc.), no por clase puntual del horario. Sobrevive a los
   cambios de grilla: si Violeta mueve el Reformer de las 9 a las 10, el pack la sigue.

3. **Descuentos** — ¿es un porcentaje que Violeta le clava a una alumna
   ("a Fulana 20% siempre"), un código promocional que la alumna tipea, o un precio
   promocional con vigencia sobre un pack? Se pueden hacer los tres, pero conviene
   empezar por uno.

4. **"Pack que se repite todas las semanas"** — ¿se refiere a **renovación automática**
   del pack cada mes/semana, o el checkbox era solo para clases?

5. **Yoga** — las 7 clases de Yoga en producción: ¿se borran o se archivan? Tienen
   bookings de demo asociados.

6. **Efectivo** — cuando la secretaría carga un pago en efectivo, ¿debe poder cobrar un
   **monto distinto** al precio de lista del pack (seña, precio pactado)?

---

# Plan de implementación

Ordenado por dependencias reales, no por lo que suena más urgente.

## Fase A — Desbloqueos y fixes cortos ✅ (18-ago-2026)

Sin dependencias entre sí, se pueden hacer en cualquier orden.

- **A1. Teléfono E.164** (#4) — sacar el `replace(/\D/g,"")` de `/pago`, componente de
  input con prefijo de país, normalizar en los dos server actions que escriben `phone`.
- **A2. Solo Pilates** (#8) — migración del CHECK, limpiar los 8 puntos del código,
  decidir qué pasa con las 7 clases de Yoga, actualizar metadata del sitio.
- **A3. Clases de 50 min** (#10) — default 50', `time_end` autocalculado al mover el
  inicio, selector de hora en pasos de 50 minutos.
- **A4. Timezone servidor** (#11) — helper único anclado a
  `America/Argentina/Buenos_Aires`, corregir `fetchMonthlyRevenue` y `assignPack`,
  correr los crons en horario AR, `run_pack_alerts` con fechas locales.
- **A5. Borrar `new-class-form.tsx`** — código muerto, dos fuentes de verdad.

## Fase B — Catálogo: profesores, salas y tipos de clase ✅ (18-ago-2026)

- **B1. Tabla `teachers`** (#9) — CRUD mínimo en admin, `class_templates.teacher` pasa a
  FK. Migrar los 3 nombres existentes (ojo con la variante sin tildes).
- **B2. Tabla `rooms`** — mismo tratamiento, saca el CHECK constraint de `room`.
- **B3. Tabla `class_types`** — **nueva, salió de la decisión 2.** Reformer, Mat,
  Cadillac, etc. Es la unidad sobre la que se arman los packs.

  > ⚠️ Hoy `room` mezcla sala con tipo: `'Reformer'` es uno de los tres valores
  > permitidos de sala. Al separar los conceptos hay que revisar las 5 clases de
  > Pilates cargadas y decidir el tipo de cada una.

- **B4. Pantalla `/admin/packs`** (#1) — listado + alta/edición/baja, precio en pesos con
  conversión a centavos, activar/desactivar, orden. **Desbloquea la home**, que hoy está
  vacía.
- **B5. Clase única vs recurrente** (#12) — `class_templates` gana `recurrence`
  (`weekly` | `once`) + `specific_date`; el generador de agenda respeta ambas. Checkbox
  real en el formulario de creación.

## Fase C — Packs ↔ tipos de clase y clases sueltas ✅ (18-ago-2026)

Depende de B3 y B4.

- **C1. Tabla `pack_class_types`** (#2) — qué tipos habilita cada pack.
- **C2. `class_templates.price`** (#3) — precio individual, en centavos. Una clase es
  **suelta** cuando su tipo no está en ningún pack activo, o cuando se la marca a mano
  con `is_standalone` (ver nota abajo).
- **C3. Reescribir `book_spot()`** — que elija un pack **cuyo `class_type` cubra esa
  clase**, en vez del más reciente; y que las sueltas no consuman créditos sino que
  vayan por el camino de pago individual. Es la parte delicada: toca la función de
  reserva que ya está en producción con 264 bookings.

**Bugs preexistentes que aparecieron al reescribir `book_spot`:**

- `cancel_booking` devolvía el crédito al pack activo **más reciente**, no al que
  se había cobrado. Con un solo pack por alumna pasaba desapercibido; con packs
  por tipo de clase, una alumna con pack de Reformer y otro de Mat recuperaba el
  crédito en el pack equivocado. Ahora la reserva guarda de qué pack salió
  (`bookings.user_pack_id`) y el crédito vuelve ahí.
- `bookings_unique_user_class_date` es UNIQUE sobre (user_id, template_id, date)
  **sin filtrar por estado**, pero `book_spot` solo miraba reservas confirmadas o
  en espera. Resultado: **una alumna que cancelaba una clase no podía volver a
  reservarla nunca** — el insert reventaba con un 23505 crudo. Ahora la reserva
  reutiliza la fila cancelada.

> **Supuesto tomado (confirmar con Violeta):** como la pertenencia se deriva del *tipo*,
> por defecto todas las clases de un tipo caen dentro del mismo pack. Para poder dejar
> una clase puntual afuera (una masterclass de Reformer que se cobra aparte, por
> ejemplo) agrego un `is_standalone` por clase que pisa la regla del tipo. Si Violeta
> nunca necesita esa excepción, la columna sobra y se saca.

## Fase D — Dinero

- **D1. Tabla `payments`** (#5) — monto, método (`cash` | `transfer` | `mercadopago`),
  quién lo cargó, a qué `user_pack` corresponde. Flujo "cargar pago en efectivo" en el
  panel, que asigna créditos y registra el pago en una sola operación.
- **D2. Ingresos reales** — `fetchMonthlyRevenue` pasa a leer `payments` en vez de
  estimar sobre precios de lista.
- **D3. Tabla `settings`** (#6) — sección "Pagos" en el panel con alias, CBU, titular y
  banco; `/pago` los lee de ahí en vez del CBU hardcodeado.
- **D4. Descuentos** (#7) — al final, porque necesita packs (B3), pagos (D1) y la
  decisión 3 tomada.

## Qué dejar afuera por ahora

Mercado Pago (#pendiente viejo) va después de D1/D3: sin registro de pagos ni datos
bancarios cargados, integrarlo es construir sobre arena.
