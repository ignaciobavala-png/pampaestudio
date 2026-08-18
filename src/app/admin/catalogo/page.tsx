"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCatalogItem,
  fetchCatalogs,
  renameCatalogItem,
  setCatalogItemActive,
  type CatalogItem,
  type CatalogKind,
  type Catalogs,
} from "./actions";

const SECTIONS: { kind: CatalogKind; title: string; hint: string; placeholder: string }[] = [
  {
    kind: "teachers",
    title: "Instructoras",
    hint: "Quiénes pueden dar clase. Antes estaban fijas en el código.",
    placeholder: "Nombre y apellido",
  },
  {
    kind: "rooms",
    title: "Salas",
    hint: "Los espacios del estudio.",
    placeholder: "Ej: Sala 1",
  },
  {
    kind: "class_types",
    title: "Tipos de clase",
    hint: "Reformer, Mat, etc. Los packs se arman por tipo de clase.",
    placeholder: "Ej: Cadillac",
  },
];

function CatalogSection({
  title,
  hint,
  placeholder,
  items,
  onCreate,
  onRename,
  onToggle,
}: {
  title: string;
  hint: string;
  placeholder: string;
  items: CatalogItem[];
  onCreate: (name: string) => Promise<string | null>;
  onRename: (id: string, name: string) => Promise<string | null>;
  onToggle: (id: string, isActive: boolean) => Promise<string | null>;
}) {
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
            className="flex items-center gap-2 rounded-[11px] border border-[rgba(26,25,31,.1)] px-3 py-2"
          >
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
                  <span className="rounded-[100px] bg-muted px-2 py-0.5 text-[11px] text-ink-dim">
                    {item.inUse} clase{item.inUse === 1 ? "" : "s"}
                  </span>
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
                  onClick={() => run(() => onToggle(item.id, !item.isActive))}
                  className="cursor-pointer rounded-[8px] px-2 py-1 text-[12px] text-ink-dim hover:text-foreground disabled:opacity-50"
                >
                  {item.isActive ? "Desactivar" : "Reactivar"}
                </button>
              </>
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
            title={s.title}
            hint={s.hint}
            placeholder={s.placeholder}
            items={catalogs?.[s.kind] ?? []}
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
