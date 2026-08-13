import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Clock, ArrowRight, Plus, Minus } from "lucide-react";

const CATEGORIES = ["IC", "TLK", "EIC", "EIP", "R", "Os", "IR", "KM", "SKM", "KMŁ", "KS", "KW", "RE", "S"];
const CARRIERS = ["PKP IC", "PR", "KM", "KMŁ", "SKM", "KD", "KŚ", "KW", "ŁKA", "SKMT", "Arriva", "Leo Express", "RegioJet"];

// Konwertuje minuty od północy na HH:mm
function minutesToTime(totalMin) {
  const wrapped = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function BulkTrainForm({ stations, onSubmit, loading }) {
  const [form, setForm] = useState({
    line_name: "",
    category: "",
    carrier: "",
    origin_station: "",
    destination_station: "",
    start_time: "00:00",
    interval_minutes: 7,
    travel_minutes: 30,
  });

  // Podgląd wygenerowanych odjazdów
  const preview = useMemo(() => {
    const [sh, sm] = form.start_time.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const interval = Math.max(1, Number(form.interval_minutes) || 1);
    const travel = Math.max(1, Number(form.travel_minutes) || 1);
    const items = [];
    let current = startMin;
    let count = 0;
    while (current < 1440 && count < 300) {
      items.push({
        departure: minutesToTime(current),
        arrival: minutesToTime(current + travel),
      });
      current += interval;
      count++;
    }
    return items;
  }, [form.start_time, form.interval_minutes, form.travel_minutes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { category, carrier, origin_station, destination_station } = form;
    if (!category || !carrier || !origin_station || !destination_station || !form.start_time) return;
    const trains = preview.map((p) => ({
      line_name: form.line_name.trim() || undefined,
      category,
      carrier,
      departure_time: p.departure,
      arrival_time: p.arrival,
      origin_station,
      destination_station,
    }));
    onSubmit(trains);
  };

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const adjust = (key, delta) => setForm((f) => ({ ...f, [key]: Math.max(1, (Number(f[key]) || 1) + delta) }));

  const inputClass = "bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-amber-400/20 h-12";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4 text-amber-400" />
        <p className="text-sm text-slate-400">
          Wygeneruj pociągi na całą dobę — podaj trasę, godzinę startu i interwał, a system utworzy odjazdy co X minut od 00:00.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Nazwa / Linia (opcjonalnie)</Label>
        <Input
          value={form.line_name}
          onChange={(e) => update("line_name", e.target.value)}
          placeholder="np. SKM Gdynia — Gdańsk"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Kategoria</Label>
          <Select value={form.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Wybierz kategorię" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-white focus:bg-amber-500/20 focus:text-amber-200">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Przewoźnik</Label>
          <Select value={form.carrier} onValueChange={(v) => update("carrier", v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Wybierz przewoźnika" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {CARRIERS.map((c) => (
                <SelectItem key={c} value={c} className="text-white focus:bg-amber-500/20 focus:text-amber-200">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Skąd</Label>
          <Select value={form.origin_station} onValueChange={(v) => update("origin_station", v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Stacja początkowa" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white focus:bg-amber-500/20 focus:text-amber-200">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Dokąd</Label>
          <Select value={form.destination_station} onValueChange={(v) => update("destination_station", v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Stacja końcowa" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white focus:bg-amber-500/20 focus:text-amber-200">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Start
          </Label>
          <Input
            type="time"
            value={form.start_time}
            onChange={(e) => update("start_time", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Interwał (min)</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjust("interval_minutes", -1)}
              className="w-10 h-12 rounded-lg bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </button>
            <Input
              type="number"
              min="1"
              value={form.interval_minutes}
              onChange={(e) => update("interval_minutes", e.target.value)}
              className={`${inputClass} text-center font-mono`}
            />
            <button
              type="button"
              onClick={() => adjust("interval_minutes", 1)}
              className="w-10 h-12 rounded-lg bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Czas przejazdu (min)</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjust("travel_minutes", -5)}
              className="w-10 h-12 rounded-lg bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </button>
            <Input
              type="number"
              min="1"
              value={form.travel_minutes}
              onChange={(e) => update("travel_minutes", e.target.value)}
              className={`${inputClass} text-center font-mono`}
            />
            <button
              type="button"
              onClick={() => adjust("travel_minutes", 5)}
              className="w-10 h-12 rounded-lg bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Podgląd */}
      <div className="bg-slate-950/60 rounded-xl border border-slate-700/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-amber-300/70 tracking-widest uppercase">
            Podgląd wygenerowanych odjazdów
          </span>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
            {preview.length} pociągów
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {preview.slice(0, 200).map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-slate-800/50 rounded-md px-2 py-1 text-xs font-mono"
            >
              <span className="text-white">{p.departure}</span>
              <ArrowRight className="w-2.5 h-2.5 text-amber-400/50" />
              <span className="text-slate-400">{p.arrival}</span>
            </div>
          ))}
          {preview.length > 200 && (
            <span className="text-xs text-slate-500 px-2 py-1">+{preview.length - 200} więcej...</span>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || preview.length === 0}
        className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold tracking-wide transition-all duration-200"
      >
        <Layers className="w-4 h-4 mr-2" />
        {loading ? "Dodawanie..." : `Dodaj ${preview.length} pociągów masowo`}
      </Button>
    </form>
  );
}
