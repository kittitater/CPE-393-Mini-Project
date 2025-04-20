// pages/register.js
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpUri, setOtpUri] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, { email, password });
      setOtpUri(res.data.otp_uri);
      setStep(2);
      setError('');
    } catch {
      setError('❌ Registration failed.');
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register/verify`, { email, otp });
      localStorage.setItem('token', res.data.access_token);
      router.push('/vote');
    } catch {
      setError('❌ Invalid OTP.');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 p-8 bg-glass-white rounded-xl shadow-md border border-white/10">
        <h2 className="text-3xl text-cyber mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyber placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyber placeholder-gray-400"
          />
          <button className="btn w-full">Register</button>
        </form>
        
        ) : (
          <>
            <p className="text-center mb-3">Scan the QR code with your authenticator app:</p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpUri)}`}
                alt="OTP QR"
                className="rounded-lg border p-1 shadow-lg"
              />
            </div>
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
              <button className="btn w-full">Verify & Continue</button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
