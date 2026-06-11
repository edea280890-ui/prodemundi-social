"use client";

import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";

const ranking = [
  {
    position: 1,
    name: "Emiliano",
    points: 128,
    exacts: 14,
    streak: 6,
    trend: "up",
  },
  {
    position: 2,
    name: "Lucas",
    points: 116,
    exacts: 11,
    streak: 4,
    trend: "same",
  },
  {
    position: 3,
    name: "Matías",
    points: 104,
    exacts: 9,
    streak: 2,
    trend: "down",
  },
  {
    position: 4,
    name: "Sofía",
    points: 97,
    exacts: 7,
    streak: 3,
    trend: "up",
  },
  {
    position: 5,
    name: "Valentín",
    points: 88,
    exacts: 5,
    streak: 1,
    trend: "same",
  },
];

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === "up") {
    return (
      <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 font-[family-name:var(--font-montserrat)] text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
        ▲ Subiendo
      </div>
    );
  }

  if (trend === "down") {
    return (
      <div className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-1 font-[family-name:var(--font-montserrat)] text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
        ▼ Bajando
      </div>
    );
  }

  return (
    <div className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 font-[family-name:var(--font-montserrat)] text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
      —
    </div>
  );
}

export default function RankingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] font-[family-name:var(--font-montserrat)] text-white">
      <Sidebar />

      {/* Fondo */}
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

      {/* Glow */}
      <div className="absolute right-[-120px] top-[120px] h-[320px] w-[320px] rounded-full bg-[#d4af37]/12 blur-3xl" />
      <div className="absolute left-[-120px] top-[260px] h-[320px] w-[320px] rounded-full bg-[#5b0013]/25 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-10 xl:pl-[320px]">
        {/* Hero */}
        <div className="mb-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.30em] text-[#d4af37]">
              Ranking global
            </p>

            <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-extrabold leading-none">
              Tabla de
              <span className="block text-[#ffd978]">
                posiciones
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Competí contra tus amigos y seguí el rendimiento
              de cada participante en tiempo real.
            </p>
          </div>

          <div className="hidden xl:block">
            <Image
              src="/jugador9.png"
              alt="Jugador"
              width={260}
              height={260}
              className="object-contain drop-shadow-[0_0_60px_rgba(212,175,55,0.30)]"
            />
          </div>
        </div>

        {/* Podio */}
        <div className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {ranking.slice(0, 3).map((player, index) => (
            <article
              key={player.position}
              className={`
                relative
                overflow-hidden
                rounded-3xl
                border
                p-6
                backdrop-blur-2xl
                transition
                duration-300
                hover:-translate-y-1

                ${
                  index === 0
                    ? "border-[#d4af37]/35 bg-[#d4af37]/10 shadow-[0_0_50px_rgba(212,175,55,0.12)]"
                    : "border-[#d4af37]/15 bg-black/40"
                }
              `}
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#d4af37]/10 blur-3xl" />

              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 font-[family-name:var(--font-rajdhani)] text-3xl font-bold text-[#ffd978]">
                    {player.position}
                  </div>

                  <TrendIndicator trend={player.trend} />
                </div>

                <h2 className="font-[family-name:var(--font-exo2)] text-3xl font-extrabold">
                  {player.name}
                </h2>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      Puntos
                    </p>

                    <p className="mt-1 font-[family-name:var(--font-rajdhani)] text-6xl font-bold leading-none text-white">
                      {player.points}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      Exactos
                    </p>

                    <p className="mt-1 font-[family-name:var(--font-rajdhani)] text-3xl font-bold text-[#ffd978]">
                      {player.exacts}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-3xl border border-[#d4af37]/15 bg-black/40 backdrop-blur-2xl">
          <div className="grid grid-cols-[90px_1.5fr_1fr_1fr_1fr] border-b border-[#d4af37]/10 px-6 py-5 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            <div>Posición</div>
            <div>Jugador</div>
            <div>Puntos</div>
            <div>Exactos</div>
            <div>Racha</div>
          </div>

          <div className="divide-y divide-white/5">
            {ranking.map((player) => (
              <div
                key={player.position}
                className="grid grid-cols-[90px_1.5fr_1fr_1fr_1fr] items-center px-6 py-5 transition duration-300 hover:bg-white/[0.03]"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/15 bg-[#d4af37]/10 font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-[#ffd978]">
                    {player.position}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {player.name}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Participante activo
                  </p>
                </div>

                <div className="font-[family-name:var(--font-rajdhani)] text-4xl font-bold leading-none text-white">
                  {player.points}
                </div>

                <div className="font-[family-name:var(--font-rajdhani)] text-3xl font-bold text-[#ffd978]">
                  {player.exacts}
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-2 font-[family-name:var(--font-rajdhani)] text-xl font-bold text-[#ffd978]">
                    {player.streak}
                  </div>

                  <TrendIndicator trend={player.trend} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}