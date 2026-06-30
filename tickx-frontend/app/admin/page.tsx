"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venueName: "",
    eventDate: ""
  });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Authenticating as Admin...");

    try {
      const authRes = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password123" })
      });
      const authData = await authRes.json();
      
      if (!authRes.ok) throw new Error(authData.error || "Failed to authenticate.");

      setStatus("Spawning Event and 500 Seats in Database...");

      const eventRes = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.token}`
        },
        body: JSON.stringify({
          ...formData,
          eventDate: new Date(formData.eventDate).toISOString() 
        })
      });

      const eventData = await eventRes.json();

      if (eventRes.ok) {
        setStatus(`Success! Spawned: ${eventData.event.title}`);
        setFormData({ title: "", description: "", venueName: "", eventDate: "" });
      } else {
        setStatus(`Error: ${eventData.error}`);
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto mt-12">
        

        <div className="mb-10 border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
            Admin Panel
          </h1>
          <p className="text-zinc-400">Create a new concert and instantly generate the stadium map.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
          <div className="grid grid-cols-1 gap-6">
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Event Title</label>
              <input 
                required
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="e.g. Cyberpunk 2026 Live"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Venue Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="e.g. Madison Square Garden"
                value={formData.venueName}
                onChange={(e) => setFormData({...formData, venueName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Event Date & Time</label>
              <input 
                required
                type="datetime-local" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Description</label>
              <textarea 
                required
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Describe the event..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-4 w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'EXECUTING...' : 'SPAWN EVENT & SEATS'}
            </button>

          </div>
        </form>

        {status && (
          <div className="mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-700 text-center font-mono text-sm text-zinc-300">
            {status}
          </div>
        )}

      </div>
    </main>
  );
}