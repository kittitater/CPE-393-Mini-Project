
import { useState } from 'react';
import axios from 'axios';

export default function VerifyVote(){
  const [receipt,setReceipt]=useState('');
  const [status,setStatus]=useState('');
  async function verify(){
    const res = await axios.get('http://localhost:3002/api/vote/verify/'+receipt);
    setStatus(res.data.counted ? 'Counted ✅' : 'Not found ❌');
  }
  return(
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Verify Your Vote</h1>
      <input value={receipt} onChange={e=>setReceipt(e.target.value)} className="border p-2" placeholder="Receipt hash"/>
      <button onClick={verify} className="bg-blue-600 text-white px-4 py-2 ml-2">Verify</button>
      {status && <div className="mt-2">{status}</div>}
    </div>
  )
}
