
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login(){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();
  async function submit(e){
    e.preventDefault();
    const res = await axios.post('http://localhost:3002/api/auth/login',{username,password});
    localStorage.setItem('token', res.data.token);
    router.push('/vote');
  }
  return (
    <form onSubmit={submit} className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Login</h1>
      <input placeholder="Username" className="border p-2" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
      <input type="password" placeholder="Password" className="border p-2" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button className="bg-blue-600 text-white px-4 py-2">Login</button>
    </form>
  );
}
