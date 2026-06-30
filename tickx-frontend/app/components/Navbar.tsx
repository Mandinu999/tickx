"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("tickx_token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("tickx_token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="w-full bg-black/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        
        <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 hover:opacity-80 transition-opacity">
          TickX
        </Link>

        <div className="flex items-center gap-8 text-sm font-bold">
          <Link href="/" className={`transition-colors ${pathname === '/' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>
            Live Map
          </Link>
          
          {isLoggedIn && (
            <>
              <Link href="/tickets" className={`transition-colors ${pathname === '/tickets' ? 'text-green-400' : 'text-zinc-500 hover:text-green-400'}`}>
                My Tickets
              </Link>
              <Link href="/dashboard" className={`transition-colors ${pathname === '/dashboard' ? 'text-purple-400' : 'text-zinc-500 hover:text-purple-400'}`}>
                Organizer Studio
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center">
          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              className="text-zinc-500 hover:text-red-400 text-sm font-bold transition-colors"
            >
              Log Out
            </button>
          ) : (
            <Link 
              href="/login" 
              className="bg-white text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Log In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}