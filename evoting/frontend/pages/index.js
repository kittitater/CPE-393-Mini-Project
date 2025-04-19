import Link from 'next/link'
export default function Home(){
  return <main className="h-screen flex flex-col items-center justify-center gap-4">
    <h1 className="text-4xl font-bold">Secure E-Voting</h1>
    <div className="flex gap-3">
      <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
      <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded">Login</Link>
    </div>
  </main>
}
