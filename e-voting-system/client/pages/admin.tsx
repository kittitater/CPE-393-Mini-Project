
import { useState } from 'react';
import axios from 'axios';

export default function Admin(){
  const [total,setTotal]=useState('');
  async function tally(){
    const res = await axios.get('http://localhost:3002/api/vote/tally');
    setTotal(res.data.total);
  }
  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Admin Tally</h1>
      <button onClick={tally} className="bg-purple-700 text-white px-4 py-2">Run Tally</button>
      {total && <div className="mt-2">Aggregate sum (encrypted votes): {total}</div>}
    </div>
  );
}
