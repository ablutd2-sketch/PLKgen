import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/Navbar";
import StationForm from "@/components/StationForm";
import { MapPin, Trash2 } from "lucide-react";

export default function AddStation() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  useEffect(() => {
    loadStations();
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

  const loadStations = async () => {
    setLoadingList(true);
    const list = await base44.entities.Station.list();
    setStations(list);
    setLoadingList(false);
  };

  const handleAdd = async (data) => {
    setLoading(true);
    await base44.entities.Station.create(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setStations((prev) => prev.filter((s) => s.id !== id));
    try {
      await base44.entities.Station.delete(id);
    } catch (e) {
      // stacja mogła już zostać usunięta — ignoruj
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Stacje <span className="text-amber-400">PKP</span>
        </h1>
        <p className="text-slate-500 text-sm mb-8">Zarządzaj bazą stacji kolejowych</p>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 p-6 mb-8 shadow-xl shadow-black/10">
          <StationForm onSubmit={handleAdd} loading={loading} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-amber-300/70 tracking-widest uppercase mb-4">
            Zarejestrowane stacje ({stations.length})
          </h2>
          {loadingList ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : stations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Brak stacji. Dodaj pierwszą powyżej.</p>
            </div>
          ) : (
            stations.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 rounded-xl px-5 py-3.5 group hover:border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-white font-medium">{s.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
