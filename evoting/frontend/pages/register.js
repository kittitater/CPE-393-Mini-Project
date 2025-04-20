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
      <div className="max-w-md mx-auto mt-12 p-8 bg-white/5 backdrop-blur-md rounded-xl shadow-lg border border-white/10">
        <h2 className="text-3xl text-cyber mb-6 text-center animate-glow">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
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
            <button className="btn w-full">Register</button>
          </form>
        ) : (
          <>
            <p className="text-center mb-3 text-sm text-gray-300">
              Scan this QR code with your authenticator app:
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpUri)}`}
                alt="OTP QR"
                className="rounded-lg border p-1 shadow-[0_0_15px_#00ddeb]"
              />
            </div>
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#1f2937] border border-cyber/30 text-cyber focus:outline-none focus:ring-2 focus:ring-cyber placeholder-cyber/50"
                />
              <button className="btn w-full">Verify & Continue</button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
