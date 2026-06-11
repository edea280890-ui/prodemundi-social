"use client";

import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";

const rewards = [
  {
    title: "Campeón del torneo",
    description: "Mayor cantidad de puntos al finalizar la competencia.",
    reward: "Diploma + Insignia Legendaria",
    color: "gold",
  },
  {
    title: "Más exactos",
    description: "Mayor cantidad de resultados exactos acertados.",
    reward: "Badge Dorado",
    color: "red",
  },
  {
    title: "Remontada épica",
    description: "Mayor subida de posiciones durante el torneo.",
    reward: "Trofeo Especial",
    color: "white",
  },
  {
    title: "Invicto semanal",
    description: "Fecha perfecta sin errores.",
    reward: "Medalla Premium",
    color: "gold",
  },
];

const rewardStyles: Record<string, string> = {
  gold: "border-[#d4af37]/25 bg-[#d4af37]/10",
  red: "border-[#b91c1c]/25 bg-[#b91c1c]/10",
  white: "border-white/10 bg-white/[0.03]",
};

export default function RewardsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
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
      <div className="absolute left-[-120px] top-[260px] h-[320px] w-[320px] rounded-full bg-[#b91c1c]/18 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-10 xl:pl-[320px]">
        {/* Hero */}
        <div className="mb-12 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#d4af37]">
              Sistema de premios
            </p>
            <h1 className="font-[family-name:var(--font-cinzel)] text-5xl font-black leading-none">
              Recompensas
              <span className="block text-[#d4af37]">
                premium
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Competí por premios automáticos, diplomas y reconocimientos
              especiales durante cada torneo.
            </p>
          </div>

          <div className="hidden xl:block">
            <Image
              src="/jugador33.png"
              alt="Jugador decorativo"
              width={280}
              height={280}
              className="object-contain drop-shadow-[0_0_60px_rgba(212,175,55,0.30)]"
            />
          </div>
        </div>

        {/* Card principal */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-[linear-gradient(135deg,rgba(212,175,55,0.14),rgba(0,0,0,0.45))] p-8 backdrop-blur-2xl">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#d4af37]/15 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f6d365]">
              Premio máximo
            </p>

            <h2 className="mt-3 font-[family-name:var(--font-cinzel)] text-5xl font-black leading-none">
              Campeón
              <span className="block text-[#d4af37]">
                PRODEMUNDI
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300">
              El ganador del torneo recibirá reconocimiento especial,
              insignia premium, podio destacado y diploma final compartible.
            </p>

            <button className="mt-8 rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/10 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#f6d365] transition hover:bg-[#d4af37]/15">
              Ver premios finales
            </button>
          </div>
        </div>

        {/* Grid de premios */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {rewards.map((reward) => (
            <article
              key={reward.title}
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

                ${rewardStyles[reward.color]}
              `}
            >
              <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#d4af37]/10 blur-3xl" />

              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Recompensa
                </p>

                <h3 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl font-black text-white">
                  {reward.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {reward.description}
                </p>

                <div className="mt-6 inline-flex rounded-xl border border-[#d4af37]/20 bg-black/30 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#f6d365]">
                  {reward.reward}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}