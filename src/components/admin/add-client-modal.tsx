"use client";

import { useCallback, useState } from "react";
import { createManagedUser, createAuthUser } from "@/app/admin/clientes/actions";
import { cn } from "@/lib/utils";

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type Mode = "managed" | "auth";

export function AddClientModal({ open, onClose, onCreated }: AddClientModalProps) {
  const [mode, setMode] = useState<Mode>("auth");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ message: string; tempPassword?: string } | null>(null);

  const reset = useCallback(() => {
    setName(""); setPhone(""); setEmail(""); setPassword("");
    setError(null); setDone(null); setLoading(false); setMode("auth");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose]
  );

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const res =
      mode === "auth"
        ? await createAuthUser(name, email, phone, password || undefined)
        : await createManagedUser(name, phone);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone({ message: res.message, tempPassword: res.tempPassword });
    onCreated();
  };

  if (!open) return null;

  const inputCls =
    "w-full rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[13px] py-[10px] text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary";

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(26,25,31,.4)] backdrop-blur-sm p-5"
    >
      <div className="w-[460px] max-w-full overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(26,25,31,.22)]">
        <div className="flex items-center justify-between border-b border-[rgba(26,25,31,.085)] px-5 py-[18px]">
          <span className="text-[15px] font-semibold">Agregar alumna</span>
          <button
            onClick={handleClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[rgba(26,25,31,.14)] bg-white text-[15px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-[18px]">
          {done ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-[12px] bg-[#EEF1EB] px-4 py-3 text-[13px] text-[#385127]">
                {done.message}
              </div>
              {done.tempPassword && (
                <div className="rounded-[12px] bg-[#EFEFED] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-dim">
                    Contraseña temporal
                  </div>
                  <div className="mt-1 font-mono text-[15px] font-semibold select-all">
                    {done.tempPassword}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-dim">
                    Compartila con la alumna. Podrá cambiarla al ingresar.
                  </div>
                </div>
              )}
              <button
                onClick={handleClose}
                className="mt-1 cursor-pointer rounded-[11px] bg-primary py-[11px] text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Listo
              </button>
            </div>
          ) : (
            <>
              {/* Toggle con/sin acceso */}
              <div className="mb-4 flex gap-1 rounded-[12px] bg-[#EFEFED] p-1">
                {([
                  ["auth", "Con acceso a la app"],
                  ["managed", "Solo registro interno"],
                ] as [Mode, string][]).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-[9px] py-2 text-[12px] font-medium transition-colors",
                      mode === m ? "bg-white text-foreground shadow-sm" : "text-ink-dim hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="mb-4 text-[12px] leading-relaxed text-ink-dim">
                {mode === "auth"
                  ? "Crea una cuenta con email y contraseña. La alumna puede iniciar sesión y reservar sola."
                  : "Crea un registro para llevar packs y reservas de alguien que no usa la app. El admin le reserva las clases."}
              </p>

              <div className="flex flex-col gap-2.5">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Nombre y apellido *"
                />
                {mode === "auth" && (
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className={inputCls}
                    placeholder="Email *"
                  />
                )}
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="Teléfono (opcional)"
                />
                {mode === "auth" && (
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Contraseña (opcional, se genera una si la dejás vacía)"
                  />
                )}
              </div>

              {error && (
                <div className="mt-3 rounded-[10px] bg-naranja-soft px-3 py-2 text-[12.5px] text-destructive">
                  {error}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-white py-[11px] text-[12.5px] font-medium text-ink-dim transition-colors hover:bg-[#EFEFED]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 cursor-pointer rounded-[11px] bg-primary py-[11px] text-[12.5px] font-semibold text-white transition-opacity disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear alumna"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
