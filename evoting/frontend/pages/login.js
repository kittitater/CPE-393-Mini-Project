import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleCredentials = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      setStep(2);
      setError('');
    } catch {
      setError('⚠️ Invalid credentials.');
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/otp`, { email, otp });
      localStorage.setItem('token', res.data.access_token);
      router.push('/vote');
    } catch {
      setError('❌ Invalid OTP.');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 p-8 bg-white/5 backdrop-blur-md rounded-xl shadow-lg border border-white/10">
        <h2 className="text-3xl text-cyber mb-6 text-center animate-glow">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-[#1f2937] border border-cyber/30 text-cyber focus:outline-none focus:ring-2 focus:ring-cyber placeholder-cyber/50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-[#1f2937] border border-cyber/30 text-cyber focus:outline-none focus:ring-2 focus:ring-cyber placeholder-cyber/50"
            />
            <button className="btn w-full">Login</button>
          </form>
        ) : (
          <form onSubmit={handleOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-[#1f2937] border border-cyber/30 text-cyber focus:outline-none focus:ring-2 focus:ring-cyber placeholder-cyber/50"
            />
            <button className="btn w-full">Verify OTP</button>
          </form>
        )}

        <div className="text-center mt-4 text-sm text-gray-400">
          Don’t have an account?{' '}
          <span
            onClick={() => router.push('/register')}
            className="text-cyber hover:underline cursor-pointer"
          >
            Register
          </span>
        </div>
      </div>
    </Layout>
  );
}
