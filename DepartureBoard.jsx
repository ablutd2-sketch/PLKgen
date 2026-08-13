import React, { useState, useMemo, useEffect } from "react";
import moment from "moment";
import { ArrowRight, Clock } from "lucide-react";

const categoryColors = {
  EIP: "bg-yellow-400",
  EIC: "bg-fuchsia-600",
  IC: "bg-orange-500",
  TLK: "bg-blue-500",
  IR: "bg-green-500",
  R: "bg-emerald-600",
  Os: "bg-teal-500",
  KM: "bg-green-500",
  SKM: "bg-red-500",
  KMŁ: "bg-violet-500",
  KS: "bg-pink-500",
  KW: "bg-indigo-500",
  RE: "bg-sky-500",
  S: "bg-lime-500",
};

// Deterministyczny losowy wynik dla danego pociągu — zawsze ten sam dla tego samego id
function getTrainVariant(trainId) {
  let hash = 0;
  for (let i = 0; i < trainId.length; i++) {
    hash = (hash * 31 + trainId.charCodeAt(i)) >>> 0;
  }
  const roll = hash % 100; // 0–99
  if (roll < 20) return "delayed";       // 20% opóźnienie
  if (roll < 41) return "early";         // 21% przed czasem
  return "on_time";                      // 59% planowy
}

// Losowe minuty opóźnienia/przyspieszenia (2–15 min) deterministycznie
function getOffsetMinutes(trainId) {
  let hash = 0;
  for (let i = 0; i < trainId.length; i++) {
    hash = (hash * 53 + trainId.charCodeAt(i)) >>> 0;
  }
  return 2 + (hash % 14); // 2–15 minut
}

// Oblicza najbliższe wystąpienie godziny HH:mm względem "now"
function getNextOccurrence(timeStr, now) {
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export default function DepartureBoard({ trains, stations, type }) {
  const stationMap = {};
  stations.forEach((s) => { stationMap[s.id] = s.name; });

  // Lokalny zegar — odświeża tablicę co 30 s
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return trains
      .map((t) => {
        const timeStr = type === "departures" ? t.departure_time : t.arrival_time;
        const nextDate = getNextOccurrence(timeStr, now);
        return { train: t, baseDate: nextDate, timeStr };
      })
      .sort((a, b) => a.baseDate - b.baseDate)
      .slice(0, 50);
  }, [trains, type, now]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">
          Brak {type === "departures" ? "odjazdów" : "przyjazdów"}
        </p>
        <p className="text-slate-600 text-sm mt-1">Dodaj pociągi, aby zobaczyć tablicę</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-3 px-4 text-amber-300/70 text-xs font-semibold tracking-widest uppercase">Kat.</th>
            <th className="text-left py-3 px-4 text-amber-300/70 text-xs font-semibold tracking-widest uppercase">Nazwa/Linia</th>
            <th className="text-left py-3 px-4 text-amber-300/70 text-xs font-semibold tracking-widest uppercase">Przewoźnik</th>
            <th className="text-left py-3 px-4 text-amber-300/70 text-xs font-semibold tracking-widest uppercase">Relacja</th>
            <th className="text-left py-3 px-4 text-amber-300/70 text-xs font-semibold tracking-widest uppercase">
              {type === "departures" ? "Odjazd" : "Przyjazd"}
            </th>
            <th className="text-left py-3 px-4 text-amber-300/70 text-xs font-semibold tracking-widest uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(({ train, baseDate }) => {
            const customDelay = train.delay_minutes && train.delay_minutes > 0;

            const variant = customDelay ? "delayed" : getTrainVariant(train.id);
            const offsetMin = customDelay ? train.delay_minutes : getOffsetMinutes(train.id);

            let actualDate = new Date(baseDate);
            if (variant === "delayed") actualDate = new Date(baseDate.getTime() + offsetMin * 60000);
            else if (variant === "early") actualDate = new Date(baseDate.getTime() - offsetMin * 60000);

            const diffMs = actualDate - now;
            const diffMin = Math.round(diffMs / 60000);

            let statusText = "";
            let statusClass = "";
            let timeColor = "text-white";
            let delayLabel = null;

            if (variant === "delayed") {
              if (diffMin <= 5) {
                statusText = type === "departures" ? "Odjeżdża" : "Przyjeżdża";
                statusClass = "text-red-400 animate-pulse";
              } else {
                statusText = `Opóźnienie +${offsetMin} min`;
                statusClass = "text-red-400";
              }
              timeColor = "text-red-400";
              delayLabel = `+${offsetMin}'`;
            } else if (variant === "early") {
              if (diffMin <= 5) {
                statusText = type === "departures" ? "Odjeżdża" : "Przyjeżdża";
                statusClass = "text-green-400 animate-pulse";
              } else {
                statusText = `Przed czasem -${offsetMin} min`;
                statusClass = "text-green-400";
              }
              timeColor = "text-green-400";
              delayLabel = `-${offsetMin}'`;
            } else {
              if (diffMin <= 5) {
                statusText = type === "departures" ? "Odjeżdża" : "Przyjeżdża";
                statusClass = "text-green-400 animate-pulse";
              } else if (diffMin <= 30) {
                statusText = `za ${diffMin} min`;
                statusClass = "text-amber-400";
              } else {
                statusText = "Planowy";
                statusClass = "text-slate-400";
              }
              timeColor = "text-white";
            }

            const isNext = filtered[0].train.id === train.id && variant === "on_time" && diffMin > 5;

            const colorClass = categoryColors[train.category] || "bg-slate-500";

            return (
              <tr
                key={train.id}
                className={`border-b border-slate-800/50 transition-colors duration-200 ${
                  isNext ? "bg-amber-500/5" : "hover:bg-slate-800/30"
                }`}
              >
                <td className="py-3.5 px-4">
                  <span className={`${colorClass} text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wide`}>
                    {train.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-200 text-sm font-semibold">{train.line_name || <span className="text-slate-600">—</span>}</td>
                <td className="py-3.5 px-4 text-slate-300 text-sm font-medium">{train.carrier}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">{stationMap[train.origin_station] || "—"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400/60 flex-shrink-0" />
                    <span className="text-white font-medium">{stationMap[train.destination_station] || "—"}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-lg font-bold ${timeColor}`}>
                      {moment(actualDate).format("HH:mm")}
                    </span>
                    {delayLabel && (
                      <span className={`font-mono text-xs font-bold line-through text-slate-500`}>
                        {moment(baseDate).format("HH:mm")}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-sm font-medium ${statusClass}`}>
                    {isNext && (
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                    )}
                    {statusText}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
