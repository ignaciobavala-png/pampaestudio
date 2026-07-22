"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchClientOptions } from "@/app/admin/actions";
import type { ClientOption } from "@/lib/admin-types";

interface AddStudentModalProps {
  open: boolean;
  className: string;
  excludeUserIds: string[];
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}

export function AddStudentModal({
  open,
  className,
  excludeUserIds,
  onClose,
  onConfirm,
}: AddStudentModalProps) {
  const [options, setOptions] = useState<ClientOption[]>([]);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      fetchClientOptions().then(setOptions);
    }
  }, [open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const filtered = useMemo(() => {
    const exclude = new Set(excludeUserIds);
    const q = search.toLowerCase();
    return options.filter((o) => !exclude.has(o.id) && (!q || o.name.toLowerCase().includes(q)));
  }, [options, excludeUserIds, search]);

  const handlePick = async (userId: string) => {
    setPending(userId);
    await onConfirm(userId);
    setPending(null);
  };

  if (!open) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(26,25,31,.4)] backdrop-blur-sm p-5"
    >
      <div className="w-[460px] max-w-full overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(26,25,31,.22)]">
        <div className="flex items-center justify-between border-b border-[rgba(26,25,31,.085)] px-5 py-[18px]">
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold">Agregar alumna</span>
            <span className="text-[12px] text-ink-dim">{className}</span>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[rgba(26,25,31,.14)] bg-white text-[15px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-[18px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 w-full rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[13px] py-[10px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary"
            placeholder="Buscar alumna..."
          />

          <div className="max-h-[300px] overflow-y-auto rounded-[12px] border border-[rgba(26,25,31,.14)]">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-ink-dim">
                {options.length === 0 ? "Cargando alumnas..." : "Sin alumnas disponibles."}
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  disabled={pending !== null}
                  onClick={() => handlePick(o.id)}
                  className="flex w-full items-center justify-between border-b border-[rgba(26,25,31,.085)] px-[14px] py-[11px] text-left transition-colors last:border-0 hover:bg-[#FAFAFA] disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-sm font-medium">{o.name}</span>
                  <span className="text-[12px] font-semibold text-primary">
                    {pending === o.id ? "Agregando..." : "Agregar +"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
