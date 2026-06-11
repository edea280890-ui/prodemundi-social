"use client";

import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";

const history = [
  {
    date: "Fecha 1",
    match: "Argentina vs Brasil",
    prediction: "2 - 1",
    result: "2 - 1",
    points: 10,
    status: "Exacto",
  },
  {
    date: "Fecha 1",
    match: "Francia vs España",
    prediction: "1 - 1",
    result: "2 - 1",
    points: 0,
    status: "Fallado",
  },
  {
    date: "Fecha 2",
    match: "Uruguay vs Alemania",
    prediction: "1 - 0",
    result: "2 - 0",
    points: 5,
    status: "Ganador",
  },
];

export default function HistoryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
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
        <div className="mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#d4af37]">
            Historial
          </p>

          <h1 className="font-[family-name:var(--font-cinzel)] text-5xl font-black leading-none">
            Tus jornadas
            <span className="block text-[#d4af37]">jugadas</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Revisá tus pronósticos anteriores, puntos obtenidos y resultados
            exactos dentro de cada fecha.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-[#d4af37]/15 bg-black/40 p-6 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Puntos históricos
            </p>
            <p className="mt-3 text-5xl font-black text-[#f6d365]">15</p>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/15 bg-black/40 p-6 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Exactos
            </p>
            <p className="mt-3 text-5xl font-black text-white">1</p>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/15 bg-black/40 p-6 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Mejor fecha
            </p>
            <p className="mt-3 text-5xl font-black text-[#b91c1c]">10</p>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-[#d4af37]/15 bg-black/40 backdrop-blur-2xl">
          <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] border-b border-[#d4af37]/10 px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            <div>Fecha</div>
            <div>Partido</div>
            <div>Pronóstico</div>
            <div>Resultado</div>
            <div>Puntos</div>
            <div>Estado</div>
          </div>

          <div className="divide-y divide-white/5">
            {history.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] items-center px-6 py-5 transition hover:bg-white/[0.03]"
              >
                <div className="text-sm font-bold text-zinc-300">
                  {item.date}
                </div>

                <div className="font-bold text-white">{item.match}</div>

                <div className="text-sm text-zinc-300">{item.prediction}</div>

                <div className="text-sm text-zinc-300">{item.result}</div>

                <div className="text-2xl font-black text-[#f6d365]">
                  +{item.points}
                </div>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                      item.status === "Exacto"
                        ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f6d365]"
                        : item.status === "Ganador"
                        ? "border-white/15 bg-white/[0.04] text-zinc-300"
                        : "border-[#b91c1c]/30 bg-[#b91c1c]/10 text-red-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}