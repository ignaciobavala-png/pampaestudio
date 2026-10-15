"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCatalogItem,
  deleteClassFromCatalog,
  fetchCatalogClasses,
  fetchCatalogs,
  reassignClasses,
  removeCatalogItem,
  renameCatalogItem,
  setCatalogItemActive,
  type CatalogClass,
  type CatalogItem,
  type CatalogKind,
  type Catalogs,
} from "./actions";

const SECTIONS: { kind: CatalogKind; title: string; hint: string; placeholder: string; noun: string }[] = [
  {
    kind: "teachers",
    title: "Instructoras",
    hint: "Quiénes pueden dar clase. Antes estaban fijas en el código.",
    placeholder: "Nombre y apellido",
    noun: "instructora",
  },
  {
    kind: "rooms",
    title: "Salas",
    hint: "Los espacios físicos del estudio. No es lo mismo que el tipo de clase.",
    placeholder: "Ej: Sala 1",
    noun: "sala",
  },
  {
    kind: "class_types",
    title: "Tipos de clase",
    hint: "Reformer, Mat, etc. Los packs se arman por tipo de clase.",
    placeholder: "Ej: Cadillac",
    noun: "tipo",
  },
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function classLabel(c: CatalogClass) {
  const when =
    c.recurrence === "once" && c.specificDate
      ? c.specificDate.split("-").reverse().join("/")
      : DAYS[c.dayOfWeek];
  return `${when} ${c.timeStart}–${c.timeEnd}`;
}

/** Lista las clases que usan un elemento y deja pasarlas a otro o eliminarlas. */
function ClassesPanel({
  kind,
  item,
  others,
  noun,
  onChanged,
}: {
  kind: CatalogKind;
  item: CatalogItem;
  others: CatalogItem[];
  noun: string;
  onChanged: () => Promise<void>;
}) {
  const [classes, setClasses] = useState<CatalogClass[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogClasses(kind, item.id).then((data) => {
      if (!cancelled) setClasses(data);
    });
    return () => {
      cancelled = true;
    };
  }, [kind, item.id, refreshKey]);

  const done = async (message: string) => {
    setNote(message);
    setConfirmId(null);
    setRefreshKey((k) => k + 1);
    await onChanged();
  };

  const move = async (toId: string, target: { templateId: string } | { fromId: string }) => {
    if (!toId) return;
    setBusy(true);
    const res = await reassignClasses(kind, toId, target);
    setBusy(false);
    const to = others.find((o) => o.id === toId)?.name ?? "";
    if (!res.ok) setNote(res.error);
    else await done(`Listo: ${res.moved === 1 ? "1 clase pasó" : `${res.moved} clases pasaron`} a ${to}.`);
  };

  const remove = async (id: string) => {
    setBusy(true);
    const res = await deleteClassFromCatalog(id);
    setBusy(false);
    if (!res.ok) setNote(res.error);
    else await done("Clase eliminada. Las reservas futuras se cancelaron y los créditos volvieron a las alumnas.");
  };

  const selectCls =
    "cursor-pointer rounded-[8px] border border-[rgba(26,25,31,.14)] bg-white px-2 py-1 text-[12px] disabled:opacity-50";

  return (
    <div className="mt-1.5 mb-1 rounded-[11px] bg-[#F7F7F6] p-3">
      {classes === null ? (
        <p className="text-[12.5px] text-ink-dim">Cargando…</p>
      ) : classes.length === 0 ? (
        <p className="text-[12.5px] text-ink-dim">No tiene clases activas.</p>
      ) : (
        <>
          {others.length > 0 && classes.length > 1 && (
            <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-[rgba(26,25,31,.085)] pb-2">
              <span className="text-[12px] font-semibold">Pasar todas a</span>
              <select
                disabled={busy}
                value=""
                onChange={(e) => move(e.target.value, { fromId: item.id })}
                className={selectCls}
              >
                <option value="">Elegir {noun}…</option>
                {others.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}
          <ul className="flex flex-col gap-1.5">
            {classes.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 text-[12.5px]">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-ink-dim"> · {classLabel(c)}</span>
                </span>
                {others.length > 0 && (
                  <select
                    disabled={busy}
                    value=""
                    onChange={(e) => move(e.target.value, { templateId: c.id })}
                    className={selectCls}
                  >
                    <option value="">Pasar a…</option>
                    {others.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                )}
                {confirmId === c.id ? (
                  <button
                    disabled={busy}
                    autoFocus
                    onClick={() => remove(c.id)}
                    onBlur={() => setConfirmId(null)}
                    className="cursor-pointer rounded-[8px] bg-naranja-soft px-2 py-1 text-[12px] font-semibold text-destructive"
                  >
                    ¿Seguro? Eliminar
                  </button>
                ) : (
                  <button
                    disabled={busy}
                    onClick={() => setConfirmId(c.id)}
                    className="cursor-pointer rounded-[8px] px-2 py-1 text-[12px] text-destructive hover:bg-naranja-soft"
                  >
                    Eliminar clase
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {note && <p className="mt-2 text-[12px] text-ink-dim">{note}</p>}
    </div>
  );
}

function CatalogSection({
  title,
  hint,
  placeholder,
  items,
  onCreate,
  onRename,
  onToggle,
  onRemove,
  onChanged,
  kind,
  noun,
}: {
  kind: CatalogKind;
  noun: string;
  title: string;
  hint: string;
  placeholder: string;
  items: CatalogItem[];
  onCreate: (name: string) => Promise<string | null>;
  onRename: (id: string, name: string) => Promise<string | null>;
  onToggle: (id: string, isActive: boolean) => Promise<string | null>;
  onRemove: (id: string) => Promise<string | null>;
  onChanged: () => Promise<void>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; msg: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<string | null>) => {
    setBusy(true);
    setError(await fn());
    setBusy(false);
  };

  return (
    <section className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-[22px]">
      <h2 className="font-serif text-[22px] tracking-[-0.01em]">{title}</h2>
      <p className="mt-0.5 mb-4 text-[12.5px] text-ink-dim">{hint}</p>

      <ul className="mb-4 flex flex-col gap-1.5">
        {items.length === 0 && (
          <li className="text-[13px] text-ink-dim">Todavía no hay ninguno.</li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-[11px] border border-[rgba(26,25,31,.1)] px-3 py-2"
          >
            <div className="flex flex-wrap items-center gap-2">
            {editingId === item.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-[8px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-2 py-1 text-[13px] outline-none focus:border-primary"
                />
                <button
                  disabled={busy}
                  onClick={async () => {
                    const err = await onRename(item.id, editValue);
                    setError(err);
                    if (!err) setEditingId(null);
                  }}
                  className="cursor-pointer rounded-[8px] bg-primary px-2.5 py-1 text-[12px] font-semibold text-white disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="cursor-pointer rounded-[8px] px-2 py-1 text-[12px] text-ink-dim hover:text-foreground"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span
                  className={`flex-1 text-[13.5px] ${item.isActive ? "text-foreground" : "text-ink-dim line-through"}`}
                >
                  {item.name}
                </span>
                {item.inUse > 0 && (
                  <button
                    onClick={() => {
                      setOpenId(openId === item.id ? null : item.id);
                      setRowError(null);
                    }}
                    className="cursor-pointer rounded-[100px] bg-muted px-2 py-0.5 text-[11px] text-foreground transition-colors hover:bg-[#E4E4E1]"
                  >
                    {item.inUse} clase{item.inUse === 1 ? "" : "s"} {openId === item.id ? "▴" : "▾"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setEditValue(item.name);
                    setError(null);
                  }}
                  className="cursor-pointer rounded-[8px] px-2 py-1 text-[12px] text-ink-dim hover:text-foreground"
                >
                  Renombrar
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (!item.isActive) return run(() => onToggle(item.id, true));
                    if (item.inUse > 0) {
                      setOpenId(item.id);
                      setRowError({
                        id: item.id,
                        msg: `Para quitar a ${item.name} primero pasá sus ${item.inUse} clase${item.inUse === 1 ? "" : "s"} a otra opción, o eliminalas.`,
                      });
                      return;
                    }
                    setRowError(null);
                    return run(() => onRemove(item.id));
                  }}
                  className="cursor-pointer rounded-[8px] px-2 py-1 text-[12px] text-ink-dim hover:text-foreground disabled:opacity-50"
                >
                  {item.isActive ? "Quitar" : "Reactivar"}
                </button>
              </>
            )}
            </div>
            {rowError?.id === item.id && (
              <p className="mt-2 rounded-[10px] bg-[#FDE8E8] px-3 py-2 text-[12px] text-[#C0392B]">
                {rowError.msg}
              </p>
            )}
            {openId === item.id && (
              <ClassesPanel
                kind={kind}
                item={item}
                noun={noun}
                others={items.filter((o) => o.isActive && o.id !== item.id)}
                onChanged={onChanged}
              />
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key !== "Enter" || !draft.trim()) return;
            const err = await onCreate(draft);
            setError(err);
            if (!err) setDraft("");
          }}
          placeholder={placeholder}
          className="flex-1 rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[10px] text-sm outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white"
        />
        <button
          disabled={busy || !draft.trim()}
          onClick={async () => {
            const err = await onCreate(draft);
            setError(err);
            if (!err) setDraft("");
          }}
          className="cursor-pointer rounded-[11px] bg-primary px-4 py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#3A0313] disabled:opacity-50"
        >
          Agregar
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-[10px] bg-[#FDE8E8] px-3 py-2 text-[12px] text-[#C0392B]">
          {error}
        </p>
      )}
    </section>
  );
}

export default function CatalogoPage() {
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);

  // El fetch va aparte del setState para que el efecto pueda descartar una
  // respuesta que llegó tarde (si el componente se desmontó mientras tanto).
  const load = useCallback(async () => {
    setCatalogs(await fetchCatalogs());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogs().then((data) => {
      if (!cancelled) setCatalogs(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Las actions devuelven el mensaje de error, o null si salió bien. */
  const wrap = async (result: { ok: true } | { ok: false; error: string }) => {
    if (!result.ok) return result.error;
    await load();
    return null;
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Catálogo</h1>
        <p className="mt-1 text-[13px] text-ink-dim">
          Instructoras, salas y tipos de clase. Lo que cargues acá aparece en el
          formulario de nueva clase.
        </p>
      </div>

      <div className="grid max-w-[1100px] gap-4 grid-cols-3 max-[1100px]:grid-cols-1">
        {SECTIONS.map((s) => (
          <CatalogSection
            key={s.kind}
            kind={s.kind}
            noun={s.noun}
            title={s.title}
            hint={s.hint}
            placeholder={s.placeholder}
            items={catalogs?.[s.kind] ?? []}
            onChanged={load}
            onRemove={async (id) => wrap(await removeCatalogItem(s.kind, id))}
            onCreate={async (name) => wrap(await createCatalogItem(s.kind, name))}
            onRename={async (id, name) => wrap(await renameCatalogItem(s.kind, id, name))}
            onToggle={async (id, isActive) =>
              wrap(await setCatalogItemActive(s.kind, id, isActive))
            }
          />
        ))}
      </div>
    </div>
  );
}
