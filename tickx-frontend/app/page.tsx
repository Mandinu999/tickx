"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Event = { id: string; title: string; eventDate: string; };
type Ticket = { id: string; seatNumber: string; status: "AVAILABLE" | "LOCKED" | "SOLD"; price: string; };

export default function Home() {
  const router = useRouter();
  const [jwtToken, setJwtToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEventId, setActiveEventId] = useState("");
  const [seats, setSeats] = useState<Ticket[]>([]);
  const [cart, setCart] = useState<Ticket[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("tickx_token");
      if (token) setJwtToken(token);
      try {
        const eventRes = await fetch("http://localhost:3000/api/events");
        const eventData = await eventRes.json();
        if (eventData.events && eventData.events.length > 0) {
          setEvents(eventData.events);
          setActiveEventId(eventData.events[0].id);
        }
      } catch (error) { console.error("Failed to fetch events:", error); } 
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!activeEventId) return;
    const fetchSeats = async () => {
      try {
        const seatRes = await fetch(`http://localhost:3000/api/events/${activeEventId}/seats`);
        const seatData = await seatRes.json();
        
        
        const sortedSeats = seatData.seats.sort((a: Ticket, b: Ticket) => {
          const seatA = parseInt(a.seatNumber.split('Seat ')[1]) || 0;
          const seatB = parseInt(b.seatNumber.split('Seat ')[1]) || 0;
          return seatA - seatB;
        });

        setSeats(sortedSeats);
        setCart([]);
      } catch (error) { console.error("Failed to fetch seats:", error); }
    };
    fetchSeats();
  }, [activeEventId]);

  const handleSeatClick = async (seat: Ticket) => {
    if (seat.status !== "AVAILABLE") return; 
    if (!jwtToken) { alert("Hold up! Log in to reserve seats."); router.push("/login"); return; }
    try {
      setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, status: "LOCKED" } : s));
      const res = await fetch("http://localhost:3000/api/tickets/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` },
        body: JSON.stringify({ eventId: activeEventId, seatNumber: seat.seatNumber })
      });
      if (res.ok) { setCart(prev => [...prev, seat]); } 
      else {
        const data = await res.json();
        alert(data.error);
        setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, status: "AVAILABLE" } : s));
      }
    } catch (error) { console.error("Error locking seat:", error); }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    let successCount = 0;
    for (const seat of cart) {
      try {
        const res = await fetch("http://localhost:3000/api/tickets/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` },
          body: JSON.stringify({ eventId: activeEventId, seatNumber: seat.seatNumber, paymentToken: "tok_visa_123" })
        });
        if (res.ok) {
          successCount++;
          setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, status: "SOLD" } : s));
        }
      } catch (error) { console.error("Checkout failed for seat:", seat.seatNumber); }
    }
    setIsCheckingOut(false); setCart([]);
    alert(`Checkout Complete! Purchased ${successCount} tickets.`);
  };

  const getSeatColor = (status: string) => {
    if (status === "AVAILABLE") return "bg-green-500 hover:bg-green-400 cursor-pointer shadow-green-500/50";
    if (status === "LOCKED") return "bg-yellow-500 animate-pulse";
    if (status === "SOLD") return "bg-zinc-800 border border-zinc-700 opacity-50 cursor-not-allowed";
    return "bg-gray-500";
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold animate-pulse">LOADING...</div>;


  const cartTotal = cart.reduce((sum, seat) => sum + parseFloat(seat.price || "0"), 0).toFixed(2);
  

  const maxColumns = seats.length > 0 ? Math.max(...seats.map(s => parseInt(s.seatNumber.split('Seat ')[1]) || 0)) : 25;
  const gridCols = maxColumns > 0 ? maxColumns : 25;

  return (
    <main className="min-h-screen flex flex-col bg-black text-white font-sans pb-24">
      <div className="flex-grow p-8 max-w-6xl mx-auto w-full">
        
        <div className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">TickX Booking</h1>
            <select className="mt-2 bg-zinc-900 border border-zinc-700 text-white text-lg rounded-lg p-2" value={activeEventId} onChange={(e) => setActiveEventId(e.target.value)}>
              {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
          <div className="flex flex-col items-end gap-4 text-sm font-bold">
             {jwtToken ? (
                <div className="flex items-center gap-4">
                  <button onClick={() => router.push("/tickets")} className="text-green-400 hover:text-green-300 transition-colors">My Tickets</button>
                  <button onClick={() => { localStorage.removeItem("tickx_token"); window.location.reload(); }} className="text-zinc-400 hover:text-red-400 transition-colors">Log Out</button>
                </div>
             ) : ( <button onClick={() => router.push("/login")} className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200">Log In to Buy</button> )}
          </div>
        </div>

        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-t-3xl h-12 flex items-center justify-center mb-10">
          <span className="text-zinc-500 font-black tracking-[0.5em] text-xs">STAGE</span>
        </div>

        {}
        <div className="grid gap-2 p-6 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
          {seats.map((seat) => (
            <div
              key={seat.id}
              title={`${seat.seatNumber} - $${seat.price}`}
              onClick={() => handleSeatClick(seat)}
              className={`aspect-square rounded-sm transition-all duration-200 ${getSeatColor(seat.status)}`}
            />
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Your Cart</h3>
              <p className="text-zinc-400">{cart.length} seat(s) locked.</p>
            </div>
            <div className="flex items-center gap-6">
              {}
              <p className="text-2xl font-black text-green-400">${cartTotal}</p>
              <button onClick={handleCheckout} disabled={isCheckingOut} className="bg-green-600 hover:bg-green-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.4)] disabled:opacity-50">
                {isCheckingOut ? "PROCESSING..." : "PAY NOW"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}