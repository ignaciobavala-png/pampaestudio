export default function ClientesPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Clientes</h1>
        <p className="mt-1 text-[13px] text-ink-dim">18 activas este mes</p>
      </div>
      <div className="mb-[18px]">
        <input
          className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-white px-[14px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary"
          placeholder="Buscar por nombre o email..."
        />
      </div>
      <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-20 text-center">
        <div className="font-serif text-[32px] italic text-[#DEDDDA]">○</div>
        <p className="mt-2 text-[13px] text-ink-dim">Grilla de clientes — parte 2.</p>
      </div>
    </div>
  );
}
