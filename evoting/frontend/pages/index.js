// frontend/pages/index.js
import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="text-center py-10">
        <h2 className="text-4xl font-bold mb-6 text-gray-800">Welcome to Secure E-Voting</h2>
        <p className="text-lg mb-8 text-gray-600">Cast your vote securely and easily.</p>
        <div className="flex justify-center gap-6">
          <Link href="/login">
            <a className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">Login</a>
          </Link>
          <Link href="/register">
            <a className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">Register</a>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;