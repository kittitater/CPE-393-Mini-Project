
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Register(){
  const [username,setUsername]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();
  async function submit(e){
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3002/api/auth/register', {
        username, email, password
      });
      alert('Your OTP is: ' + res.data.otp); // ✅ now res is defined
      router.push('/verify');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  }
  
  return (
    <form onSubmit={submit} className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Register</h1>
      <input placeholder="Username" className="border p-2" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
      <input placeholder="Email" className="border p-2" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input type="password" placeholder="Password" className="border p-2" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button className="bg-blue-600 text-white px-4 py-2">Register</button>
    </form>
  );
}
