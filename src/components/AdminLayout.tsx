import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

type AdminLayoutProps = {
  children: ReactNode;
  title: string;
};

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
