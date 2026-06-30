"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("USER");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  
  const [formData, setFormData] = useState({ 
  title: "", description: "", venueName: "", eventDate: "",
  price: 99.99, rows: 10, seatsPerRow: 20 
});
  const [isSpawning, setIsSpawning] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("tickx_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/events");
        const data = await res.json();
        
        setLoading(false);
      } catch (error) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleUpgrade = async () => {
    const token = localStorage.getItem("tickx_token");
    setStatus("Upgrading profile on PostgreSQL...");

    try {
      const res = await fetch("http://localhost:3000/api/auth/upgrade", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setUserRole("ORGANIZER");
        setStatus("Upgrade complete! You are now an Organizer.");
      } else {
        setStatus(` ${data.error}`);
      }
    } catch (err) {
      setStatus("Connection failed.");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSpawning(true);
    setStatus("Generating 500-seat configuration...");

    const token = localStorage.getItem("tickx_token");

    try {
      const res = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          eventDate: new Date(formData.eventDate).toISOString()
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`Event Created!`);
        setFormData({ title: "", description: "", venueName: "", eventDate: "" , price: 99.99, rows: 10, seatsPerRow: 20 });
      } else {
        setStatus(` ${data.error}`);
      }
    } catch (err) {
      setStatus("Failed to contact backend mapping engine.");
    } finally {
      setIsSpawning(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-2xl font-bold animate-pulse">BOOTING PORTAL...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto mt-12">
        
        <div className="mb-10 border-b border-zinc-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Organizer Studio
            </h1>
            <p className="text-zinc-400">Host events, create seat maps, and manage listings.</p>
          </div>
          <Link href="/" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
            ← Main Gate
          </Link>
        </div>

        {userRole !== "ORGANIZER" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">Want to sell tickets for your own shows?</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Upgrade your account to an Organizer. You will instantly gain the ability to launch custom events and auto-generate 500-seat stadium architectures directly into our relational system database.
            </p>
            <button 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black px-10 py-4 rounded-xl text-lg transition-all shadow-xl hover:scale-105"
            >
              BECOME AN ORGANIZER
            </button>
          </div>
        )}


        {userRole === "ORGANIZER" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            

            <div className="md:col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 h-fit">
              <h3 className="text-xl font-black text-purple-400 mb-3">Creator Rules</h3>
              <ul className="text-zinc-400 text-sm space-y-3 list-disc pl-4">
                <li>Every event spawned sets up a layout map grid immediately.</li>
                <li>Base pricing starts standard across rows ($99.99).</li>
                <li>Concurrent locks apply directly to your transactions.</li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleCreateEvent} className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
                <h3 className="text-2xl font-black">Launch a New Event Map</h3>
                
                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-2">Concert / Event Title</label>
                  <input required type="text" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Rock Fest 2026" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">Venue Arena Name</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Underground Club" value={formData.venueName} onChange={(e) => setFormData({...formData, venueName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">Date & Time</label>
                    <input required type="datetime-local" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-2">Public Description</label>
                  <textarea required rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Provide event details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-zinc-800 py-6 my-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">Ticket Price ($)</label>
                    <input required type="number" step="0.01" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">Number of Rows</label>
                    <input required type="number" min="1" max="50" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" value={formData.rows} onChange={(e) => setFormData({...formData, rows: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">Seats per Row</label>
                    <input required type="number" min="1" max="50" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" value={formData.seatsPerRow} onChange={(e) => setFormData({...formData, seatsPerRow: parseInt(e.target.value)})} />
                  </div>
                </div>    
                <button type="submit" disabled={isSpawning} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg disabled:opacity-50">
                  {isSpawning ? 'COMPILING DATABASE MAP...' : 'INITIALIZE SYSTEM EVENT'}
                </button>
              </form>
            </div>

          </div>
        )}

        {status && (
          <div className="mt-8 p-4 rounded-lg bg-zinc-900 border border-zinc-700 text-center font-mono text-sm text-zinc-300">
            {status}
          </div>
        )}

      </div>
    </main>
  );
}