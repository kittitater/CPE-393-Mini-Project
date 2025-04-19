
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { encrypt, decrypt } from '../lib/crypto';

export default function Chat() {
  const [socket, setSocket] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const s = io('http://localhost:3001', {
      auth: { token }
    });
    s.on('connect', () => console.log('connected'));
    s.on('message', ({ from, ciphertext }) => {
      setLog(prev => [...prev, `${from}: ${decrypt(ciphertext)}`]);
    });
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  function send() {
    if (!socket) return;
    const ciphertext = encrypt(message);
    socket.emit('message', { to: 'broadcast', ciphertext });
    setLog(prev => [...prev, `me: ${message}`]);
    setMessage('');
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Secure Chat</h1>
      <div className="border h-64 overflow-y-auto p-2 my-2">
        {log.map((l,i)=><div key={i}>{l}</div>)}
      </div>
      <input value={message} onChange={e=>setMessage(e.target.value)}
             className="border px-3 py-2 rounded w-80" />
      <button onClick={send} className="bg-green-600 text-white px-4 py-2 rounded ml-2">Send</button>
    </div>
  );
}
