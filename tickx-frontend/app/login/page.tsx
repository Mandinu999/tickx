"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Authenticating...");

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Login successful! Entering the stadium...");
        
        localStorage.setItem("tickx_token", data.token);
        
        setTimeout(() => router.push("/"), 1000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatus(`Connection failed. Is the backend running?`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-400">Log in to your TickX account.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
          <div className="grid grid-cols-1 gap-6">
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Password</label>
              <input 
                required
                type="password" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>

          </div>
        </form>

        {status && (
          <div className="mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-700 text-center font-mono text-sm text-zinc-300">
            {status}
          </div>
        )}

        <p className="text-center mt-8 text-zinc-500">
          Don't have an account? <Link href="/register" className="text-indigo-400 hover:text-indigo-300 underline font-bold">Register here</Link>
        </p>

      </div>
    </main>
  );
}