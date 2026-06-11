"use client";

import Image from "next/image";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

type MatchStatus = "pending" | "soon" | "closed" | "live";

type Match = {
  id: number;
  home: string;
  away: string;
  time: string;
  phase: string;
  status: MatchStatus;
};

const matches: Match[] = [
  {
    id: 1,
    home: "Argentina",
    away: "Brasil",
    time: "21:00",
    phase: "Fase de grupos",
    status: "pending",
  },
  {
    id: 2,
    home: "Francia",
    away: "España",
    time: "18:30",
    phase: "Fase de grupos",
    status: "soon",
  },
  {
    id: 3,
    home: "Uruguay",
    away: "Alemania",
    time: "16:00",
    phase: "Fase de grupos",
    status: "closed",
  },
];

const statusStyles: Record<MatchStatus, string> = {
  pending: "border-[#d4af37]/35 bg-[#2b0008]/80 text-[#ffd978]",
  soon: "border-[#d4af37]/30 bg-[#5b0013]/70 text-[#ffd978]",
  closed: "border-white/10 bg-white/[0.04] text-zinc-400",
  live: "border-[#d4af37]/40 bg-[#3a0010] text-[#ffd978]",
};

const statusLabels: Record<MatchStatus, string> = {
  pending: "Disponible",
  soon: "Cierra pronto",
  closed: "Cerrado",
  live: "En vivo",
};

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<
    Record<number, { home: string; away: string }>
  >({});

  function updatePrediction(
    matchId: number,
    team: "home" | "away",
    value: string
  ) {
    const cleanValue = value.replace(/\D/g, "").slice(0, 2);

    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        home: prev[matchId]?.home ?? "",
        away: prev[matchId]?.away ?? "",
        [team]: cleanValue,
      },
    }));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] font-[family-name:var(--font-montserrat)] text-white">
      <Sidebar />

      <div
  className="absolute inset-0"
  style={{
    backgroundImage: "url('/fondo-pattern-prodemundi.png')",
    backgroundRepeat: "repeat-y",
    backgroundPosition: "center top",
    backgroundSize: "cover",
  }}
>
  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/55" />
</div>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-10 xl:pl-[320px]">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.30em] text-[#d4af37]">
              Pronósticos
            </p>

            <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-extrabold leading-none">
              Jugá tus
              <span className="block text-[#ffd978]">resultados</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Cargá tus marcadores antes del cierre y competí por puntos,
              exactos y premios automáticos.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d4af37]/15 bg-black/40 px-5 py-4 backdrop-blur-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b8a46a]">
              Cierre automático
            </p>

            <p className="mt-1 font-[family-name:var(--font-rajdhani)] text-xl font-bold text-[#ffd978]">
              30 min antes del partido
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {matches.map((match) => {
            const isClosed =
              match.status === "closed" || match.status === "live";

            const prediction = predictions[match.id] ?? {
              home: "",
              away: "",
            };

            return (
              <article
                key={match.id}
                className="relative overflow-hidden rounded-3xl border border-[#d4af37]/15 bg-black/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition duration-300 hover:border-[#d4af37]/35 hover:bg-[#2b0008]/35"
              >
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#d4af37]/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusStyles[match.status]}`}
                      >
                        {statusLabels[match.status]}
                      </span>

                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        {match.phase}
                      </span>

                      <span className="font-[family-name:var(--font-rajdhani)] text-sm font-bold uppercase tracking-[0.12em] text-[#b8a46a]">
                        {match.time}
                      </span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                      <div className="text-right">
                        <p className="font-[family-name:var(--font-exo2)] text-2xl font-extrabold text-white">
                          {match.home}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#d4af37]/25 bg-[#2b0008]/80 px-4 py-2 font-[family-name:var(--font-rajdhani)] text-lg font-bold uppercase tracking-[0.14em] text-[#ffd978]">
                        VS
                      </div>

                      <div className="text-left">
                        <p className="font-[family-name:var(--font-exo2)] text-2xl font-extrabold text-white">
                          {match.away}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <input
                      value={prediction.home}
                      disabled={isClosed}
                      onChange={(e) =>
                        updatePrediction(match.id, "home", e.target.value)
                      }
                      className="h-16 w-16 rounded-2xl border border-[#d4af37]/25 bg-[#050505]/70 text-center font-[family-name:var(--font-rajdhani)] text-3xl font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]/60 disabled:opacity-40"
                      inputMode="numeric"
                      placeholder="0"
                    />

                    <span className="font-[family-name:var(--font-rajdhani)] text-3xl font-bold text-[#d4af37]">
                      -
                    </span>

                    <input
                      value={prediction.away}
                      disabled={isClosed}
                      onChange={(e) =>
                        updatePrediction(match.id, "away", e.target.value)
                      }
                      className="h-16 w-16 rounded-2xl border border-[#d4af37]/25 bg-[#050505]/70 text-center font-[family-name:var(--font-rajdhani)] text-3xl font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]/60 disabled:opacity-40"
                      inputMode="numeric"
                      placeholder="0"
                    />

                    <button
                      disabled={isClosed}
                      className="ml-0 rounded-xl border border-[#d4af37]/35 bg-[#2b0008]/80 px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#ffd978] transition hover:border-[#d4af37]/55 hover:bg-[#3a0010] disabled:cursor-not-allowed disabled:opacity-35 lg:ml-2"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}