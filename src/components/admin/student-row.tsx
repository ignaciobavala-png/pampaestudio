interface StudentRowProps {
  name: string;
  pack: string;
  avColor: string;
  initials: string;
  onMessage?: () => void;
  onCancel?: () => void;
}

export function StudentRow({ name, pack, avColor, initials, onMessage, onCancel }: StudentRowProps) {
  return (
    <div className="group flex items-center gap-[11px] rounded-[10px] px-1.5 py-2.5 transition-colors hover:bg-[#F7F7F6] border-t border-[rgba(26,25,31,.085)]">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ background: avColor }}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium">{name}</div>
        <div className="mt-px text-[11px] text-ink-dim">{pack}</div>
      </div>
      <div className="flex gap-[5px] opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
        <button onClick={onMessage} className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-white px-[9px] py-1 text-[11px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED] whitespace-nowrap">
          Mensaje
        </button>
        <button onClick={onCancel} className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-white px-[9px] py-1 text-[11px] text-ink-dim transition-colors hover:text-destructive hover:border-red-200 hover:bg-naranja-soft whitespace-nowrap">
          Cancelar
        </button>
      </div>
    </div>
  );
}
