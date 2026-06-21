"use client";

import { useRouter } from "next/navigation";
import { NewClassForm } from "@/components/admin/new-class-form";

export default function NuevaClasePage() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Nueva clase</h1>
        <p className="mt-1 text-[13px] text-ink-dim">
          Completa los datos para agregar una clase al calendario.
        </p>
      </div>

      <NewClassForm
        onSubmit={() => {
          router.push("/admin");
        }}
        onCancel={() => router.push("/admin")}
      />
    </div>
  );
}
