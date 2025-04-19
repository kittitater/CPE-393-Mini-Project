import { useState } from 'react'
import axios from 'axios'
export default function Login(){
  const [email,setEmail]=useState(''); const[pw,setPw]=useState(''); const[otp,setOtp]=useState('');
  const [step,setStep]=useState(1); const[msg,setMsg]=useState('');
  async function login(){
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,{email,password:pw});
      setStep(2);
    }catch(e){setMsg(e.response?.data?.detail||'error')}
  }
  async function verify(){
    try{
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/otp`,{email,otp});
      localStorage.setItem('token',res.data.access_token);
      setMsg('Logged in!');
    }catch(e){setMsg(e.response?.data?.detail||'error')}
  }
  return (
    <div className="p-8 max-w-md mx-auto">
      {step===1 && <>
        <h2 className="text-xl mb-4">Login</h2>
        <input className="border p-2 w-full mb-2" placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input type="password" className="border p-2 w-full mb-2" placeholder="Password" onChange={e=>setPw(e.target.value)}/>
        <button className="bg-green-600 text-white px-4 py-2" onClick={login}>Send OTP</button>
      </>}
      {step===2 && <>
        <h2 className="text-xl mb-4">Enter OTP</h2>
        <input className="border p-2 w-full mb-2" placeholder="6‑digit OTP" onChange={e=>setOtp(e.target.value)}/>
        <button className="bg-indigo-600 text-white px-4 py-2" onClick={verify}>Verify</button>
      </>}
      <p className="mt-4">{msg}</p>
    </div>
  )
}
