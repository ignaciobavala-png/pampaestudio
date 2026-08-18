"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPack,
  deletePack,
  fetchAdminPacks,
  setPackActive,
  updatePack,
  type AdminPackRow,
  type PackFormData,
} from "./actions";

const EMPTY: PackFormData = {
  name: "",
  eyebrow: "",
  description: "",
  priceArs: 0,
  period: "monthly",
  credits: 8,
  durationDays: 30,
  features: [],
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
};

const labelCls = "text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim";
const fieldCls =
  "w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white";

function formatArs(value: number): string {
  return value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function PackForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: PackFormData;
  submitLabel: string;
  onSubmit: (data: PackFormData) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof PackFormData>(key: K, value: PackFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-[22px]">
      <div className="grid grid-cols-2 gap-[14px] mb-4 max-[860px]:grid-cols-1">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Nombre</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={fieldCls}
            placeholder="Ej: Pack Mensual 8"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Bajada (opcional)</label>
          <input
            value={form.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
            className={fieldCls}
            placeholder="Ej: El más elegido"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Precio</label>
          <input
            type="number"
            min={0}
            step={500}
            value={form.priceArs}
            onChange={(e) => set("priceArs", Number(e.target.value))}
            className={fieldCls}
          />
          <p className="text-[11px] text-ink-dim">En pesos: {formatArs(form.priceArs)}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Créditos (clases)</label>
          <input
            type="number"
            min={1}
            value={form.credits}
            onChange={(e) => set("credits", Number(e.target.value))}
            className={fieldCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Modalidad</label>
          <select
            value={form.period}
            onChange={(e) => set("period", e.target.value as PackFormData["period"])}
            className={fieldCls}
          >
            <option value="monthly">Mensual</option>
            <option value="per_class">Por clase</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Vigencia</label>
          <input
            type="number"
            min={1}
            value={form.durationDays ?? ""}
            placeholder="Sin vencimiento"
            onChange={(e) =>
              set("durationDays", e.target.value === "" ? null : Number(e.target.value))
            }
            className={fieldCls}
          />
          <p className="text-[11px] text-ink-dim">
            Días desde que se asigna. Vacío = no vence nunca.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
          <label className={labelCls}>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={`${fieldCls} h-[60px] resize-none`}
            placeholder="Cómo se lo explicás a la alumna."
          />
        </div>

        <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
          <label className={labelCls}>Qué incluye (una línea por ítem)</label>
          <textarea
            value={featuresText}
            onChange={(e) => {
              setFeaturesText(e.target.value);
              set("features", e.target.value.split("\n"));
            }}
            className={`${fieldCls} h-[80px] resize-none`}
            placeholder={"8 clases por mes\nReprogramación sin costo"}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Orden en la home</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
            className={fieldCls}
          />
        </div>

        <div className="flex flex-col justify-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
              className="size-4 accent-[var(--color-primary)]"
            />
            Destacar en la home
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="size-4 accent-[var(--color-primary)]"
            />
            Activo (visible para las alumnas)
          </label>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-[10px] bg-[#FDE8E8] px-3 py-2 text-[12px] text-[#C0392B]">
          {error}
        </p>
      )}

      <div className="flex gap-[9px]">
        <button
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-white py-[11px] text-[13px] text-ink-dim transition-colors hover:bg-[#EFEFED] hover:text-foreground"
        >
          Cancelar
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(await onSubmit({ ...form, features: form.features.filter((f) => f.trim()) }));
            setBusy(false);
          }}
          className="flex-[2] cursor-pointer rounded-[11px] bg-primary py-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-[#3A0313] disabled:opacity-50"
        >
          {busy ? "Guardando..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function PacksPage() {
  const [packs, setPacks] = useState<AdminPackRow[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPacks(await fetchAdminPacks());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const wrap = async (result: { ok: true; id?: string } | { ok: false; error: string }) => {
    if (!result.ok) return result.error;
    await load();
    return null;
  };

  const editing = packs?.find((p) => p.id === editingId) ?? null;

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Packs</h1>
          <p className="mt-1 text-[13px] text-ink-dim">
            La oferta que ven las alumnas en la home y que podés asignar desde Clientes.
          </p>
        </div>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="shrink-0 cursor-pointer rounded-[11px] bg-primary px-4 py-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-[#3A0313]"
          >
            Nuevo pack
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-5 max-w-[820px]">
          <PackForm
            initial={EMPTY}
            submitLabel="Crear pack"
            onCancel={() => setCreating(false)}
            onSubmit={async (data) => {
              const err = await wrap(await createPack(data));
              if (!err) setCreating(false);
              return err;
            }}
          />
        </div>
      )}

      {editing && (
        <div className="mb-5 max-w-[820px]">
          <PackForm
            initial={editing}
            submitLabel="Guardar cambios"
            onCancel={() => setEditingId(null)}
            onSubmit={async (data) => {
              const err = await wrap(await updatePack(editing.id, data));
              if (!err) setEditingId(null);
              return err;
            }}
          />
        </div>
      )}

      {rowError && (
        <p className="mb-4 max-w-[820px] rounded-[10px] bg-[#FDE8E8] px-3 py-2 text-[12px] text-[#C0392B]">
          {rowError}
        </p>
      )}

      {packs === null ? (
        <div className="h-[120px] max-w-[820px] animate-pulse rounded-[18px] bg-muted" />
      ) : packs.length === 0 ? (
        <div className="max-w-[820px] rounded-[18px] border border-dashed border-[rgba(26,25,31,.14)] px-[22px] py-10 text-center">
          <p className="text-[13px] text-ink-dim leading-relaxed">
            Todavía no hay ningún pack cargado, así que la home les muestra a las
            alumnas que no hay packs disponibles.
          </p>
        </div>
      ) : (
        <ul className="flex max-w-[820px] flex-col gap-2">
          {packs.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-[14px] border border-[rgba(26,25,31,.1)] bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{p.name}</span>
                  {p.isFeatured && (
                    <span className="rounded-[100px] bg-bordo-surface px-2 py-0.5 text-[10.5px] font-medium text-primary">
                      Destacado
                    </span>
                  )}
                  {!p.isActive && (
                    <span className="rounded-[100px] bg-muted px-2 py-0.5 text-[10.5px] text-ink-dim">
                      Inactivo
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[12px] text-ink-dim">
                  {formatArs(p.priceArs)} · {p.credits} crédito{p.credits === 1 ? "" : "s"} ·{" "}
                  {p.durationDays ? `${p.durationDays} días` : "sin vencimiento"}
                  {p.activeUsers > 0 && ` · ${p.activeUsers} activo${p.activeUsers === 1 ? "" : "s"}`}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingId(p.id);
                  setCreating(false);
                  setRowError(null);
                }}
                className="cursor-pointer rounded-[9px] px-2.5 py-1.5 text-[12px] text-ink-dim transition-colors hover:bg-[#EFEFED] hover:text-foreground"
              >
                Editar
              </button>
              <button
                onClick={async () => setRowError(await wrap(await setPackActive(p.id, !p.isActive)))}
                className="cursor-pointer rounded-[9px] px-2.5 py-1.5 text-[12px] text-ink-dim transition-colors hover:bg-[#EFEFED] hover:text-foreground"
              >
                {p.isActive ? "Desactivar" : "Reactivar"}
              </button>
              <button
                onClick={async () => setRowError(await wrap(await deletePack(p.id)))}
                className="cursor-pointer rounded-[9px] px-2.5 py-1.5 text-[12px] text-ink-dim transition-colors hover:bg-[#FDE8E8] hover:text-[#C0392B]"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
