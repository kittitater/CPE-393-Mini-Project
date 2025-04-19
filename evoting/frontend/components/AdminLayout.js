import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-gray-900 text-gray-100 p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin</h2>
        <nav className="flex flex-col gap-3">
          <Link href="/admin" className="hover:text-white">Elections</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
