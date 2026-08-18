/**
 * Helpers de `class_templates` compartidos entre el admin y el front de alumnas.
 *
 * Dos cosas que antes vivían desperdigadas:
 *
 * 1. Profesora, sala y tipo de clase dejaron de ser texto libre y ahora son FKs a
 *    catálogos (`teachers`, `rooms`, `class_types`). Toda query que muestre una
 *    clase necesita el mismo join.
 * 2. Una clase puede repetirse todas las semanas (`weekly`, por `day_of_week`) o
 *    pasar una sola vez (`once`, en `specific_date`). Traer "las clases del día"
 *    ya no es filtrar por `day_of_week` a secas.
 */

/** Join estándar: sin esto, la clase no tiene nombre de profe ni de sala. */
export const CLASS_TEMPLATE_SELECT =
  "*, teachers(full_name), rooms(name), class_types(name)";

/** Forma de lo que devuelve `CLASS_TEMPLATE_SELECT` para los campos del join. */
export interface ClassTemplateJoins {
  teachers: { full_name: string } | null;
  rooms: { name: string } | null;
  class_types: { name: string } | null;
}

export function teacherName(t: Pick<ClassTemplateJoins, "teachers">): string {
  return t.teachers?.full_name ?? "";
}

export function roomName(t: Pick<ClassTemplateJoins, "rooms">): string {
  return t.rooms?.name ?? "";
}

export function classTypeName(t: Pick<ClassTemplateJoins, "class_types">): string {
  return t.class_types?.name ?? "";
}

/**
 * Filtro PostgREST para las clases que ocurren un día concreto: las semanales de
 * ese día de la semana, más las únicas agendadas para esa fecha exacta.
 *
 * Se usa con `.or(...)`, y siempre en combinación con `.eq("is_active", true)`.
 */
export function dayOccurrenceFilter(dayOfWeek: number, date: string): string {
  return [
    `and(recurrence.eq.weekly,day_of_week.eq.${dayOfWeek})`,
    `and(recurrence.eq.once,specific_date.eq.${date})`,
  ].join(",");
}

/** Iniciales/nombre corto de la profe para las vistas compactas ("Camila L."). */
export function shortTeacherName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[1][0]}.`;
}
