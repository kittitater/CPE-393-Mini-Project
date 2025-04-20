import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const [homeLink, setHomeLink] = useState("/");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setHomeLink("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const admin = payload?.is_admin === true || payload?.is_admin === "true";
      setIsAdmin(admin);
      setIsLoggedIn(true);
      setHomeLink(admin ? "/admin" : "/vote");
    } catch {
      setIsLoggedIn(false);
      setHomeLink("/");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); // 💡 ensure UI updates immediately
    setIsAdmin(false);
    setHomeLink("/");
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-radial from-cyber-bg via-cyber-dark to-[#0f172a] text-white font-orbitron overflow-x-hidden">
      <Head>
        <title>Secure E‑Voting System</title>
        <meta name="description" content="Secure futuristic voting system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* HEADER */}
      <header className="relative bg-white/5 backdrop-blur-md py-5 px-6 shadow-md border-b border-white/10 animate-glow">
        <div className="max-w-6xl space-x-3 mx-auto relative flex items-center justify-between">
          {/* Smart back button */}
          <Link href={homeLink} passHref>
            <div className=" gap-1 flex items-center bg-cyber text-cyber-dark font-semibold text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-1.5 rounded shadow hover:bg-white hover:text-cyber transition ">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 2L2 9h2v9h5v-5h2v5h5V9h2L10 2z" />
              </svg>
              <span>BACK</span>
            </div>
          </Link>

          {/* Conditionally clickable title */}
          {isLoggedIn ? (
            <h1 className="text-sm sm:text-4xl text-cyber font-bold tracking-widest animate-glow text-center select-none">
              SECURE E‑VOTING SYSTEM
            </h1>
          ) : (
            <a href="/" passHref>
              <h1 className="cursor-pointer text-lg sm:text-4xl text-cyber font-bold tracking-widest animate-glow text-center hover:text-white transition">
              SECURE E‑VOTING SYSTEM
              </h1>
            </a>
          )}

          {/* Top right controls */}

          {/* Smart back button */}

          {/* Logout - only when logged in */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className=" bg-cyber text-cyber-dark font-semibold text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-1.5 rounded shadow hover:bg-white hover:text-cyber transition"
            >
              Logout
            </button>
          ) : (
           
              <div className="text-bg-gradient-radial bg-gradient-radial from-cyber-bg via-cyber-dark to-[#0f172a] font-semibold text-sm px-5 py-1 sm:text-base sm:px-4 sm:py-1.5  ">
                     
              </div>
            
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-white/5 backdrop-blur-md py-4 text-center text-sm text-gray-400 tracking-wider border-t border-white/10 animate-glow">
        © {new Date().getFullYear()} Roverant Development Group • All Rights Reserved
      </footer>
    </div>
  );
}
