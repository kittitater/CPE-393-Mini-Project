// frontend/pages/register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpUri, setOtpUri] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', { email, password });
      setOtpUri(response.data.otp_uri);
      setStep(2);
      setError('');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register/verify', { email, otp });
      localStorage.setItem('token', response.data.access_token);
      router.push('/vote');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                aria-label="Email"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                aria-label="Password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
              Register
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700">Scan this QR code with your authenticator app:</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpUri)}`}
              alt="QR Code for 2FA"
              className="mx-auto"
            />
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="One-Time Password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Verify OTP
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Register;