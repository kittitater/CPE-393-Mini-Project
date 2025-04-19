import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Verify(){
  const [username,setUsername]=useState('');
  const [otp,setOtp]=useState('');
  const [error,setError]=useState('');
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3002/api/auth/verify',{username,otp});
      if(res.data.ok) router.push('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  }

  return (
    <form onSubmit={submit} className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Verify OTP</h1>
      {error && <div className="text-red-600">{error}</div>}
      <input placeholder="Username" className="border p-2 w-full" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
      <input placeholder="OTP" className="border p-2 w-full" value={otp} onChange={e=>setOtp(e.target.value)} /><br/>
      <button className="bg-green-600 text-white px-4 py-2 w-full">Verify</button>
    </form>
  );
}
