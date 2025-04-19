import Link from 'next/link'
export default function Home(){
  return (
    <main className="h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Secure E‑Voting</h1>
      <div className="flex gap-4">
        <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded">Register</Link>
        <Link href="/login" className="px-4 py-2 bg-green-600 text-white rounded">Login</Link>
      </div>
    </main>
  )
}
