
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      router.push('/chat');
    } else { alert('Login failed'); }
  }

  return (
    <main className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold">Secure Chat Login</h1>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"
               className="border px-3 py-2 rounded w-full" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"
               className="border px-3 py-2 rounded w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </main>
  );
}
