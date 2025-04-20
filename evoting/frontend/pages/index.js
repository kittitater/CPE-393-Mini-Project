// pages/index.js
import Link from "next/link";
import Layout from "../components/Layout";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const admin = payload?.is_admin === true || payload?.is_admin === "true";
      setIsAdmin(admin);
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const goTo = isAdmin ? "/admin" : "/vote";

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

          {/* Show Vote button if logged in, otherwise Login/Register */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link href={goTo} passHref>
                <button className="btn animate-glow w-full sm:w-auto">
                  Vote & View Result
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" passHref>
                  <button className="btn animate-pulse w-full sm:w-auto">Login</button>
                </Link>
                <Link href="/register" passHref>
                  <button className="btn animate-pulse w-full sm:w-auto">Register</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
