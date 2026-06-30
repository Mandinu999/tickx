"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Booking = {
  id: string;
  createdAt: string;
  event: { title: string; venueName: string; eventDate: string };
  ticket: { seatNumber: string; price: string };
};

export default function MyTickets() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTickets = async () => {
      const token = localStorage.getItem("tickx_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/tickets/my-tickets", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-2xl font-bold animate-pulse">LOADING YOUR VAULT...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto mt-12">
        
        <div className="mb-10 border-b border-zinc-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
              My Tickets
            </h1>
            <p className="text-zinc-400">Your secure digital vault.</p>
          </div>
          <Link href="/" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white px-6 py-2 rounded-lg transition-colors font-bold shadow-md">
            ← Back to Map
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center p-12 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <h2 className="text-2xl font-bold text-zinc-500 mb-4">No tickets found.</h2>
            <Link href="/" className="text-green-400 hover:underline">Go back to the stadium and buy some seats!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
                
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-white">{booking.event.title}</h3>
                    <p className="text-zinc-400 font-medium">{booking.event.venueName}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-xs font-black tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    CONFIRMED
                  </div>
                </div>

                <div className="space-y-2 mb-6 relative z-10">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Date</span>
                    <span className="text-zinc-300">{new Date(booking.event.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Seat</span>
                    <span className="text-white font-black text-lg">{booking.ticket.seatNumber}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Paid</span>
                    <span className="text-green-400 font-black">${booking.ticket.price}</span>
                  </div>
                </div>

                <div className="w-full h-16 bg-black flex items-center justify-center opacity-80 rounded-lg flex-col relative z-10 border border-zinc-800 p-2">
                  <div className="w-full h-8 flex justify-between px-2 items-center opacity-60">
                    {[...Array(30)].map((_, i) => (
                       <div key={i} className={`h-full bg-white rounded-sm ${i % 3 === 0 ? 'w-2' : i % 2 === 0 ? 'w-1' : 'w-0.5'}`}></div>
                    ))}
                  </div>
                  <p className="text-[10px] tracking-widest text-zinc-500 mt-2 font-mono">REF: {booking.id.split('-')[0].toUpperCase()}</p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}