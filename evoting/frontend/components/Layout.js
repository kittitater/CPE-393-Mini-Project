import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const [homeLink, setHomeLink] = useState('/');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setHomeLink('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const admin = payload?.is_admin === true || payload?.is_admin === "true";
      setIsAdmin(admin);
      setIsLoggedIn(true);
      setHomeLink(admin ? '/admin' : '/vote');
    } catch {
      setIsLoggedIn(false);
      setHomeLink('/');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);       // 💡 ensure UI updates immediately
    setIsAdmin(false);
    setHomeLink('/');
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-radial from-cyber-bg via-cyber-dark to-[#0f172a] text-white font-orbitron overflow-x-hidden">
      <Head>
        <title>Secure E‑Voting</title>
        <meta name="description" content="Secure futuristic voting system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* HEADER */}
      <header className="relative bg-white/5 backdrop-blur-md py-5 px-6 shadow-md border-b border-white/10 animate-glow">
        <div className="max-w-6xl mx-auto relative flex items-center justify-center">

          {/* Conditionally clickable title */}
          {isLoggedIn ? (
            <h1 className="text-3xl sm:text-4xl text-cyber font-bold tracking-widest animate-glow text-center select-none">
              E‑VOTING SYSTEM
            </h1>
          ) : (
            <Link href="/" passHref>
              <h1 className="cursor-pointer text-3xl sm:text-4xl text-cyber font-bold tracking-widest animate-glow text-center hover:text-white transition">
                E‑VOTING SYSTEM
              </h1>
            </Link>
          )}

          {/* Top right controls */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">

            {/* Smart back button */}
            <Link href={homeLink} passHref>
              <div className="inline-flex items-center gap-2 text-cyber text-sm sm:text-base font-semibold tracking-wider hover:text-white transition cursor-pointer">
                <svg className="w-5 h-5 fill-current animate-pulse" viewBox="0 0 20 20">
                  <path d="M10 2L2 9h2v9h5v-5h2v5h5V9h2L10 2z" />
                </svg>
                <span>Back to Home</span>
              </div>
            </Link>

            {/* Logout - only when logged in */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="ml-3 bg-cyber text-cyber-dark font-semibold px-4 py-1.5 rounded shadow hover:bg-white hover:text-cyber transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-white/5 backdrop-blur-md py-4 text-center text-sm text-gray-400 tracking-wider border-t border-white/10 animate-glow">
        © {new Date().getFullYear()} Roverant Cyber Voting • All Rights Reserved
      </footer>
    </div>
  );
}
