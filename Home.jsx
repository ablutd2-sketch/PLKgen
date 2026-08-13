import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import DepartureBoard from "@/components/DepartureBoard";
import { ArrowUpFromLine, ArrowDownToLine, MapPin, RefreshCw } from "lucide-react";

export default function Home() {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  // Live clock update every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time train updates
  useEffect(() => {
    const unsub = base44.entities.Train.subscribe((event) => {
      if (event.type === "create") {
        setTrains((prev) => [...prev, event.data]);
      } else if (event.type === "update") {
        setTrains((prev) => prev.map((t) => (t.id === event.data.id ? event.data : t)));
      } else if (event.type === "delete") {
        setTrains((prev) => prev.filter((t) => t.id !== event.id));
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = base44.entities.Station.subscribe((event) => {
      if (event.type === "create") {
        setStations((prev) => [...prev, event.data]);
      } else if (event.type === "delete") {
        setStations((prev) => prev.filter((s) => s.id !== event.id));
      }
    });
    return unsub;
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [stationList, trainList] = await Promise.all([
      base44.entities.Station.list(),
      base44.entities.Train.list(),
    ]);
    setStations(stationList);
    setTrains(trainList);
    setLoading(false);
  };

  const effectiveStation = selectedStation && selectedStation !== "all" ? selectedStation : "";

  const departures = effectiveStation
    ? trains.filter((t) => t.origin_station === effectiveStation)
    : trains;

  const arrivals = effectiveStation
    ? trains.filter((t) => t.destination_station === effectiveStation)
    : trains;

  const currentTime = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Tablica <span className="text-amber-400">odjazdów</span>
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              Aktualizacja na żywo · {currentTime}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger className="bg-slate-800/60 border-slate-600/50 text-white h-11">
                  <MapPin className="w-4 h-4 text-amber-400/60 mr-2" />
                  <SelectValue placeholder="Wszystkie stacje" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white focus:bg-amber-500/20 focus:text-amber-200">
                    Wszystkie stacje
                  </SelectItem>
                  {stations.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-white focus:bg-amber-500/20 focus:text-amber-200">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={loadData}
              className="w-11 h-11 rounded-lg bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/30 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 overflow-hidden shadow-2xl shadow-black/20">
          <Tabs defaultValue="departures" className="w-full">
            <div className="border-b border-slate-800/60 px-2 pt-2">
              <TabsList className="bg-transparent gap-1 h-auto p-0">
                <TabsTrigger
                  value="departures"
                  className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 data-[state=active]:shadow-none text-slate-400 rounded-t-lg rounded-b-none px-5 py-3 text-sm font-semibold tracking-wide border-b-2 border-transparent data-[state=active]:border-amber-400 transition-all"
                >
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  Odjazdy ({departures.length})
                </TabsTrigger>
                <TabsTrigger
                  value="arrivals"
                  className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 data-[state=active]:shadow-none text-slate-400 rounded-t-lg rounded-b-none px-5 py-3 text-sm font-semibold tracking-wide border-b-2 border-transparent data-[state=active]:border-amber-400 transition-all"
                >
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Przyjazdy ({arrivals.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="departures" className="mt-0">
              <DepartureBoard trains={departures} stations={stations} type="departures" />
            </TabsContent>
            <TabsContent value="arrivals" className="mt-0">
              <DepartureBoard trains={arrivals} stations={stations} type="arrivals" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
