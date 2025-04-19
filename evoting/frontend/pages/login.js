import { useState } from 'react'
import axios from 'axios'
import { setAuth } from "../lib/api"
export default function Login(){
  const [email,setEmail]=useState('');const[pw,setPw]=useState('');
  const[needOtp,setNeedOtp]=useState(false);const[otp,setOtp]=useState('');
  const[msg,setMsg]=useState('');
  async function step1(){
    try{await axios.post(process.env.NEXT_PUBLIC_API_URL+'/api/auth/login',{email,password:pw});setNeedOtp(true);}catch(e){setMsg('Error');}
  }
  async function step2(){
    try{const res=await axios.post(process.env.NEXT_PUBLIC_API_URL+'/api/auth/otp',{email,otp});localStorage.setItem('token',res.data.access_token);setMsg('Logged In');}catch(e){setMsg('OTP error');}
  }
  if (res.data.access_token) {
    setAuth(res.data.access_token);            // NEW
    const payload = JSON.parse(atob(res.data.access_token.split(".")[1]));
    if (payload.adm) window.location.href = "/admin";
    else window.location.href = "/vote";
  }
  
  return <div className="max-w-lg p-8 mx-auto">
    {!needOtp?<>
      <h2 className="text-xl mb-4">Login</h2>
      <input className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input type="password" className="border p-2 w-full mb-2" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}/>
      <button className="bg-green-600 text-white px-4 py-2" onClick={step1}>Send OTP</button>
    </>:<>
      <h2 className="text-xl mb-4">Enter OTP</h2>
      <input className="border p-2 w-full mb-2" placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value)}/>
      <button className="bg-indigo-600 text-white px-4 py-2" onClick={step2}>Verify</button>
    </>}
    <p className="mt-4">{msg}</p>
  </div>
}
