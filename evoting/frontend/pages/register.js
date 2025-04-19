import { useState } from 'react'
import axios from 'axios'
export default function Register(){
  const [email,setEmail] = useState(''); const [pw,setPw]=useState('');
  const [msg,setMsg]=useState('')
  async function submit(){
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,{email,password:pw});
      setMsg('Registered. Check console for OTP.');
    }catch(e){setMsg(e.response?.data?.detail||'error')}
  }
  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Register</h2>
      <input className="border p-2 w-full mb-2" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="border p-2 w-full mb-2" placeholder="Password" onChange={e=>setPw(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2" onClick={submit}>Register</button>
      <p className="mt-4">{msg}</p>
    </div>
  )
}
