import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Train, Clock } from "lucide-react";

const CATEGORIES = ["IC", "TLK", "EIC", "EIP", "R", "Os", "IR", "KM", "SKM", "KMŁ", "KS", "KW", "RE", "S"];
const CARRIERS = ["PKP IC", "PR", "KM", "KMŁ", "SKM", "KD", "KŚ", "KW", "ŁKA", "SKMT", "Arriva", "Leo Express", "RegioJet"];

export default function TrainForm({ stations, onSubmit, loading }) {
  const [form, setForm] = useState({
    line_name: "",
    category: "",
    carrier: "",
    departure_time: "",
    arrival_time: "",
    origin_station: "",
    destination_station: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { category, carrier, departure_time, arrival_time, origin_station, destination_station } = form;
    if (!category || !carrier || !departure_time || !arrival_time || !origin_station || !destination_station) return;
    const payload = {
      ...form,
      line_name: form.line_name.trim() || undefined,
    };
    // EIC Tuusk — pierwsze dodanie: 10000 min opóźnienia
    if (form.category === "EIC" && form.line_name.trim() === "Tuusk") {
      payload.delay_minutes = 10000;
    }
    onSubmit(payload);
    setForm({ line_name: "", category: "", carrier: "", departure_time: "", arrival_time: "", origin_station: "", destination_station: "" });
  };

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const inputClass = "bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-amber-400/20 h-12";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase">Nazwa / Linia</Label>
        <Input
          value={form.line_name}
          onChange={(e) => update("line_name", e.target.value)}
          placeholder="np. Pendolino, 1234, Express Kraków"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Odjazd (codziennie)
          </Label>
          <Input
            type="time"
            value={form.departure_time}
            onChange={(e) => update("departure_time", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-amber-200/80 text-sm font-medium tracking-wide uppercase flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Przyjazd (codziennie)
          </Label>
          <Input
            type="time"
            value={form.arrival_time}
            onChange={(e) => update("arrival_time", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold tracking-wide transition-all duration-200"
      >
        <Train className="w-4 h-4 mr-2" />
        {loading ? "Dodawanie..." : "Dodaj pociąg"}
      </Button>
    </form>
  );
}
