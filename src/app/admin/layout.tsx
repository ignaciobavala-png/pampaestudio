import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminBotNav } from "@/components/admin/admin-botnav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F1F1EF]">
      <AdminTopbar />
      <div className="mx-auto max-w-[1180px] px-5 pb-[80px] pt-6 max-[860px]:pb-[76px]">
        {children}
      </div>
      <AdminBotNav />
    </div>
  );
}
