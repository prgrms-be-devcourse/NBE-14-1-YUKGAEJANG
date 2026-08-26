import type { Metadata } from "next";
import { AdminHeader } from './_components/AdminHeader';
import AdminSidebar from './_components/AdminSidebar';

export const metadata: Metadata = {
  title: "관리자 | Grids & Circle",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f8f4ef] text-[#3d3026]">
      <AdminHeader />

      <div className="flex min-h-[calc(100vh-82px)]">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
