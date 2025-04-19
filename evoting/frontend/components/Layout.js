// frontend/components/Layout.js
import React from 'react';
import Head from 'next/head';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Head>
        <title>Secure E-Voting System</title>
        <meta name="description" content="A secure and user-friendly e-voting platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Secure E-Voting System</h1>
      </header>
      <main className="flex-grow p-6">{children}</main>
      <footer className="bg-blue-600 text-white p-4 text-center">
        &copy; 2023 Secure E-Voting System
      </footer>
    </div>
  );
};

export default Layout;