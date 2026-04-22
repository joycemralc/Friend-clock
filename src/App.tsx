import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Camera, Globe, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Friend {
  id: string;
  name: string;
  city: string;
  timezone: string; // IANA Timezone string
  photo?: string;
}

export default function App() {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);
  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('chrono_friends');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [newFriend, setNewFriend] = useState({ name: '', city: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('chrono_friends', JSON.stringify(friends));
  }, [friends]);
  
  useEffect(() => {
    let frameId: number;
    const update = () => {
      setTime(new Date());
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const formatTime = (date: Date) => {
    const hours = is24Hour 
      ? date.getHours().toString().padStart(2, '0')
      : (date.getHours() % 12 || 12).toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    
    return { hours, minutes, seconds, ampm };
  };

  const { hours, minutes, seconds, ampm } = formatTime(time);

  // Calculate cumulative rotations for smooth hands
  const secondsDeg = (time.getSeconds() + time.getMilliseconds() / 1000) * 6;
  const minutesDeg = (time.getMinutes() + time.getSeconds() / 60) * 6;
  const hoursDeg = ((time.getHours() % 12) + time.getMinutes() / 60) * 30;

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const resolveAndAddFriend = async () => {
    if (!newFriend.name || !newFriend.city) return;
    
    setIsResolving(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Determine the IANA timezone string for the city: ${newFriend.city}. Return only the IANA string (e.g. Asia/Tokyo, America/New_York).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              timezone: { type: Type.STRING }
            },
            required: ["timezone"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const timezone = result.timezone;

      // Validate the timezone string
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch (e) {
        throw new Error("Invalid timezone resolved.");
      }

      const friend: Friend = {
        id: Math.random().toString(36).substr(2, 9),
        name: newFriend.name,
        city: newFriend.city,
        timezone: timezone,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newFriend.name}`
      };

      setFriends([...friends, friend]);
      setNewFriend({ name: '', city: '' });
      setIsAddingFriend(false);
    } catch (err) {
      console.error(err);
      setError("Could not sync city timezone.");
    } finally {
      setIsResolving(false);
    }
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const clearAllFriends = () => {
    if (confirm("Erase all registered observers? This action cannot be undone.")) {
      setFriends([]);
    }
  };

  return (
    <div className="min-h-screen w-full p-8 md:p-12 flex flex-col items-center justify-between relative selection:bg-black selection:text-white">
      {/* Sidebar Vertical Label */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 -rotate-180" style={{ writingMode: 'vertical-rl' }}>
        <span className="text-[9px] font-bold tracking-[0.5em] uppercase opacity-20">PRECISION INSTRUMENT — BUILT FOR THE CURATED OBSERVER — NO. 445-X</span>
      </div>

      {/* Top Navigation & Meta */}
      <header className="w-full flex justify-between items-start border-b border-main pb-8">
        <div className="space-y-1">
          <p className="label-meta">Reference: LA-{is24Hour ? '24A' : '12A'}</p>
          <h1 className="text-4xl font-serif italic leading-none">Chronos & Logic</h1>
        </div>
        <div className="text-right space-y-1">
          <p className="label-meta">Current Coordinate</p>
          <div className="flex items-center gap-4 justify-end">
             <button 
              onClick={() => setIs24Hour(!is24Hour)}
              className="px-2 py-0.5 border border-main rounded text-[9px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
            >
              {is24Hour ? '24H' : '12H'}
            </button>
            <p className="text-sm font-medium uppercase">LOS ANGELES • UTC {time.getTimezoneOffset() / -60 > 0 ? '+' : ''}{time.getTimezoneOffset() / -60}:00</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl flex-grow flex flex-col lg:grid lg:grid-cols-12 gap-12 py-12">
        {/* Left Side: Friends/Coordinates */}
        <section className="lg:col-span-3 space-y-8 order-2 lg:order-1">
          <div className="flex justify-between items-end border-b border-main pb-4">
             <p className="label-meta opacity-50">Global Coordinates</p>
             <div className="flex gap-2">
                {friends.length > 0 && (
                  <button 
                    onClick={clearAllFriends}
                    className="p-1 hover:bg-red-500 hover:text-white transition-colors rounded opacity-40 hover:opacity-100"
                    title="Clear All"
                  >
                    <X size={16} />
                  </button>
                )}
                <button 
                  onClick={() => setIsAddingFriend(true)}
                  className="p-1 hover:bg-black hover:text-white transition-transform rounded"
                  title="Add Observer"
                >
                  <Plus size={16} />
                </button>
             </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {friends.map(friend => (
                <motion.div 
                  key={friend.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group relative flex items-center gap-4 p-3 border border-transparent hover:border-main transition-colors rounded-xl overflow-hidden"
                >
                  <img src={friend.photo} alt={friend.name} className="w-10 h-10 rounded-full bg-gray-200 border border-main" />
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold uppercase tracking-tight">{friend.name}</h4>
                    <p className="text-[10px] font-serif italic opacity-60">{friend.city}</p>
                  </div>
                  <div className="text-right">
                    <FriendTime timezone={friend.timezone} baseTime={time} is24Hour={is24Hour} />
                  </div>
                  <button 
                    onClick={() => removeFriend(friend.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {friends.length === 0 && !isAddingFriend && (
              <p className="text-[11px] font-serif italic opacity-40 text-center py-8">No observers registered in other coordinates.</p>
            )}

            {isAddingFriend && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border border-main rounded-2xl space-y-4 bg-white/50 backdrop-blur-sm"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="label-meta block opacity-40">Full Name</label>
                    <input 
                      type="text" 
                      value={newFriend.name}
                      onChange={e => setNewFriend({...newFriend, name: e.target.value})}
                      placeholder="Enter observer name"
                      className="w-full bg-transparent border-b border-main py-1 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-meta block opacity-40">City</label>
                    <input 
                      type="text" 
                      value={newFriend.city}
                      onChange={e => setNewFriend({...newFriend, city: e.target.value})}
                      placeholder="e.g. Tokyo"
                      className="w-full bg-transparent border-b border-main py-1 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {error && <p className="text-[9px] text-red-500 uppercase font-bold tracking-tighter">{error}</p>}

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={resolveAndAddFriend} 
                    disabled={isResolving}
                    className="flex-grow bg-black text-white py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResolving ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      "Assign Coordinate"
                    )}
                  </button>
                  <button 
                    onClick={() => { setIsAddingFriend(false); setError(null); }} 
                    disabled={isResolving}
                    className="px-4 border border-main rounded text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Center: Main Clock */}
        <section className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2">
          <div className="flex flex-col items-center gap-12 lg:gap-24">
            {/* Analog Clock - Editorial Version */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center p-4">
              {/* Minimal Markers */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-full h-full p-1"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                >
                  <div className={`w-0.5 mx-auto ${i % 3 === 0 ? 'h-3 bg-[#141414]' : 'h-1 bg-[#141414]/20'}`} />
                </div>
              ))}

              {/* Central Pin */}
              <div className="w-1 h-1 bg-[#141414] rounded-full z-30" />

              {/* Hands - Sharp and Minimal */}
              <motion.div 
                className="absolute w-1 h-12 md:h-16 bg-[#141414] origin-bottom bottom-1/2 left-[calc(50%-2px)]"
                animate={{ rotate: hoursDeg }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
              />
              <motion.div 
                className="absolute w-0.5 h-20 md:h-28 bg-[#141414]/60 origin-bottom bottom-1/2 left-[calc(50%-1px)]"
                animate={{ rotate: minutesDeg }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
              />
              <motion.div 
                className="absolute w-px h-24 md:h-32 bg-[#141414]/30 origin-bottom bottom-1/2 left-[calc(50%-0.5px)] z-20"
                animate={{ rotate: secondsDeg }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            {/* Digital Hero Display */}
            <div className="relative flex items-baseline select-none">
              <h2 className="text-[120px] md:text-[180px] lg:text-[240px] leading-none font-serif font-light tracking-tighter">
                {hours}:{minutes}
              </h2>
              <div className="flex flex-col ml-4 md:ml-8 mb-4 md:mb-8">
                <span className="text-2xl md:text-4xl font-serif italic text-gray-400 tabular-nums">{seconds}</span>
                <span className="label-meta">Secs</span>
                {!is24Hour && <span className="label-meta mt-2">{ampm}</span>}
              </div>
              
              {/* Skewed label overlay */}
              <div className="absolute -left-6 md:-left-12 top-1/2 -rotate-90 origin-center bg-black text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase">
                Observation Mode Active
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: World Indices */}
        <section className="lg:col-span-3 space-y-8 order-3">
          <div className="border-b border-main pb-4">
             <p className="label-meta opacity-50">Global Synchronization</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2 text-[11px] font-bold uppercase tracking-wider">
               <WidgetRow label="Tokyo" timezone="Asia/Tokyo" baseTime={time} />
               <WidgetRow label="New York" timezone="America/New_York" baseTime={time} />
               <WidgetRow label="Paris" timezone="Europe/Paris" baseTime={time} />
               <WidgetRow label="London" timezone="Europe/London" baseTime={time} />
            </div>
          </div>
          
          <div className="p-6 border border-main rounded-3xl bg-[rgba(20,20,20,0.02)] space-y-4">
             <p className="label-meta opacity-50">Status Report</p>
             <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs uppercase font-medium">Atomic Sync Locked</span>
              </div>
              <p className="text-[11px] font-serif italic leading-relaxed text-gray-500">
                A static measurement of infinite progression, calculated to the nearest millisecond.
              </p>
          </div>
        </section>
      </div>

      {/* Bottom Grid */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-end border-t border-main pt-8">
        {/* Date / Calendar */}
        <div className="space-y-2">
          <p className="label-meta opacity-50">Temporal Signature</p>
          <div>
            <h3 className="text-2xl md:text-3xl font-serif">
              {time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            <p className="text-[11px] italic font-serif text-gray-500">
              The {time.getDate()}{getOrdinalSuffix(time.getDate())} day of the month
            </p>
          </div>
        </div>

        <div className="text-right hidden md:block">
           <p className="label-meta opacity-10">Chronos & Logic — Editorial No. 445-X</p>
        </div>
      </footer>
    </div>
  );
}

function FriendTime({ timezone, baseTime, is24Hour }: { timezone: string, baseTime: Date, is24Hour: boolean }) {
  const timeString = baseTime.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour12: !is24Hour,
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const [h, m_ampm] = timeString.split(':');
  const [m, ampm] = m_ampm.split(' ');

  return (
    <div className="font-mono flex flex-col items-end">
      <span className="text-sm font-bold">{h}:{m}</span>
      {!is24Hour && <span className="text-[9px] uppercase opacity-40">{ampm}</span>}
    </div>
  );
}

function WidgetRow({ label, timezone, baseTime }: { label: string, timezone: string, baseTime: Date }) {
  const timeString = baseTime.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
    <div className="flex justify-between border-b border-main pb-1 last:border-0">
      <span>{label}</span>
      <span className="font-mono">{timeString}</span>
    </div>
  );
}
