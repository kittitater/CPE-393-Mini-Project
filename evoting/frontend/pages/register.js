import { useState } from 'react'
import axios from 'axios'
export default function Register(){
  const [email,setEmail]=useState('');const[pw,setPw]=useState('');const [uri,setUri]=useState('');
  async function submit(){
    const res = await axios.post(process.env.NEXT_PUBLIC_API_URL+'/api/auth/register',{email,password:pw});
    setUri(res.data.otp_uri);
  }
  return <div className="max-w-lg mx-auto p-8">
    <h2 className="text-xl mb-4">Register</h2>
    <input className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <input type="password" className="border p-2 w-full mb-2" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}/>
    <button className="bg-blue-600 text-white px-4 py-2" onClick={submit}>Register</button>
    {uri && <><p className="mt-4">Scan in Authenticator App:</p><img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(uri)}`} alt="qr"/></>}
  </div>
}
