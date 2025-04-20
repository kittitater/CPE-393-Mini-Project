// components/Layout.js
import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-radial from-cyber-bg via-cyber-dark to-[#0f172a] text-white font-orbitron overflow-x-hidden">
      <Head>
        <title>Secure E‑Voting</title>
        <meta name="description" content="Secure futuristic voting system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* HEADER */}
      <header className="bg-white/5 backdrop-blur-md py-5 text-center shadow-md border-b border-white/10 animate-glow">
        <h1 className="text-3xl sm:text-4xl text-cyber font-bold tracking-widest animate-glow">
          E‑VOTING SYSTEM
        </h1>
      </header>

      {/* MAIN */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        {children}
      </main>

      {/* FOOTER - STICK TO BOTTOM */}
      <footer className="bg-white/5 backdrop-blur-md py-4 text-center text-sm text-gray-400 tracking-wider border-t border-white/10 animate-glow">
        © {new Date().getFullYear()} Roverant Cyber Voting • All Rights Reserved
      </footer>
    </div>
  );
}
