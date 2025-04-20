// pages/index.js
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="glass max-w-xl w-full p-10 text-center animate-fade-in-up">
          <h1 className="text-5xl text-cyber font-bold animate-glow mb-6 drop-shadow-lg tracking-widest">
            Secure E‑Voting System
          </h1>
          <p className="text-gray-300 text-md sm:text-lg mb-8">
            Welcome to the future of voting — secure, private, and blazing fast ⚡
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" passHref>
              <button className="btn animate-pulse w-full sm:w-auto">Login</button>
            </Link>
            <Link href="/register" passHref>
              <button className="btn animate-pulse w-full sm:w-auto">Register</button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
