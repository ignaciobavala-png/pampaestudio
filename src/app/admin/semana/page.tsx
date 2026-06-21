export default function SemanaPage() {
  return (
    <div>
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2.5">
        <div>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Semana</h1>
          <p className="mt-1 text-[13px] text-ink-dim">9 – 14 junio 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]">‹ Anterior</button>
          <button className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]">Siguiente ›</button>
        </div>
      </div>
      <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-20 text-center">
        <div className="font-serif text-[32px] italic text-[#DEDDDA]">○</div>
        <p className="mt-2 text-[13px] text-ink-dim">Calendario semanal — parte 2.</p>
      </div>
    </div>
  );
}
