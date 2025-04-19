
import { useState } from 'react';
import axios from 'axios';

export default function Vote(){
  const [choice,setChoice]=useState('1');
  const [receipt,setReceipt]=useState('');
  async function cast() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3002/api/vote/cast', {
        vote: Number(choice)  // ✅ Make sure it's a number
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceipt(res.data.receipt);
    } catch (err) {
      alert(err.response?.data?.error || 'Vote failed');
    }
  }  

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Cast Your Vote</h1>
      <select value={choice} onChange={e=>setChoice(e.target.value)} className="border p-2">
        <option value="1">Candidate A</option>
        <option value="2">Candidate B</option>
      </select>
      <button onClick={cast} className="bg-green-600 text-white px-4 py-2 ml-2">Vote</button>
      {receipt && <div className="mt-4">Your receipt: <code>{receipt}</code></div>}
    </div>
  );
}
