import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/Navbar";
import TrainForm from "@/components/TrainForm";
import BulkTrainForm from "@/components/BulkTrainForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Train, Trash2, ArrowRight, Plus, Layers } from "lucide-react";

const categoryColors = {
  EIP: "bg-yellow-400", EIC: "bg-fuchsia-500", IC: "bg-orange-500", TLK: "bg-blue-500",
  IR: "bg-green-500", R: "bg-emerald-600", Os: "bg-teal-500", KM: "bg-green-500",
  SKM: "bg-red-500", KMŁ: "bg-violet-500", KS: "bg-pink-500", KW: "bg-indigo-500",
  RE: "bg-sky-500", S: "bg-lime-500",
};

export default function AddTrain() {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsub = base44.entities.Train.subscribe((event) => {
      if (event.type === "create") setTrains((prev) => [...prev, event.data]);
      else if (event.type === "delete") setTrains((prev) => prev.filter((t) => t.id !== event.id));
    });
    return unsub;
  }, []);

  const loadData = async () => {
    setLoadingList(true);
    const [stationList, trainList] = await Promise.all([
      base44.entities.Station.list(),
      base44.entities.Train.list(),
    ]);
    setStations(stationList);
    setTrains(trainList);
    setLoadingList(false);
  };

  const stationMap = {};
  stations.forEach((s) => { stationMap[s.id] = s.name; });

  const handleAdd = async (data) => {
    setLoading(true);
    await base44.entities.Train.create(data);
    setLoading(false);
  };

  const handleBulkAdd = async (trainsData) => {
    setLoading(true);
    await base44.entities.Train.bulkCreate(trainsData);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Train.delete(id);
  };

  const sortedTrains = [...trains].sort((a, b) => {
    return (a.departure_time || "").localeCompare(b.departure_time || "");
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Dodaj <span className="text-amber-400">pociąg</span>
        </h1>
        <p className="text-slate-500 text-sm mb-8">Pociągi kursują 24/7 — powtarzają się codziennie</p>

        {stations.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl border border-amber-500/20 p-8 text-center">
            <Train className="w-10 h-10 text-amber-400/40 mx-auto mb-3" />
            <p className="text-amber-200/80 font-medium mb-1">Najpierw dodaj stacje</p>
            <p className="text-slate-500 text-sm">Przejdź do zakładki Stacje i dodaj co najmniej dwie stacje.</p>
          </div>
        ) : (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 p-6 mb-8 shadow-xl shadow-black/10">
            <Tabs defaultValue="single">
              <TabsList className="grid grid-cols-2 w-full mb-6 bg-slate-950/50">
                <TabsTrigger
                  value="single"
                  className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 text-slate-400 rounded-lg py-2.5 text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Pojedynczy
                </TabsTrigger>
                <TabsTrigger
                  value="bulk"
                  className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 text-slate-400 rounded-lg py-2.5 text-sm font-semibold transition-all"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Masowo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <TrainForm stations={stations} onSubmit={handleAdd} loading={loading} />
              </TabsContent>
              <TabsContent value="bulk">
                <BulkTrainForm stations={stations} onSubmit={handleBulkAdd} loading={loading} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="space-y-2 mt-8">
          <h2 className="text-sm font-semibold text-amber-300/70 tracking-widest uppercase mb-4">
            Dodane pociągi ({trains.length})
          </h2>
          {loadingList ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : trains.length === 0 ? (
            <div className="text-center py-12">
              <Train className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Brak pociągów.</p>
            </div>
          ) : (
            sortedTrains.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 rounded-xl px-5 py-3.5 group hover:border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`${categoryColors[t.category] || "bg-slate-500"} text-white text-xs font-bold px-2 py-0.5 rounded-md`}>
                    {t.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300 truncate">
                    <span className="font-medium text-white truncate">{stationMap[t.origin_station] || "—"}</span>
                    <ArrowRight className="w-3 h-3 text-amber-400/50 flex-shrink-0" />
                    <span className="font-medium text-white truncate">{stationMap[t.destination_station] || "—"}</span>
                  </div>
                  <span className="text-slate-500 text-xs font-mono hidden sm:inline">
                    {t.departure_time}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-400/10 flex-shrink-0"
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
