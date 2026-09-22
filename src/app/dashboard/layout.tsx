import Link from "next/link";
import { logout } from "../actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">Looma Links</Link>
        <form action={logout}>
          <button className="text-sm text-neutral-400 hover:text-white">Salir</button>
        </form>
      </header>
      {children}
    </div>
  );
}
