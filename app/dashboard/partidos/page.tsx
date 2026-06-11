"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import TeamLabel from "@/components/TeamLabel";

type Match = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  competition: string;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState("");

  const fetchMatches = useCallback(async () => {
    await Promise.resolve();
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMatches(data ?? []);
  }, []);

  function formatMatchDate(date: string) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMatches();
    }, 0);

    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchMatches]);

  const scheduledMatches = matches.filter((match) => match.status !== "finished");
  const finishedMatches = matches.filter((match) => match.status === "finished");

  return (
    <ProtectedRoute>
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

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 xl:pl-[320px] xl:pt-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#f6d365]">
            Calendario
          </p>

          <h1 className="mb-3 font-[family-name:var(--font-cinzel)] text-3xl font-black leading-tight xl:text-4xl">
            Partidos
          </h1>

          <p className="mb-6 max-w-2xl text-sm leading-6 text-zinc-200">
            Consultá el fixture, los estados y los resultados cargados.
          </p>

          {message && (
            <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-200">
              {message}
            </p>
          )}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#d4af37]/18 bg-black/25 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                Total
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {matches.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/18 bg-black/25 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                Programados
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {scheduledMatches.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/18 bg-black/25 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                Finalizados
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {finishedMatches.length}
              </p>
            </div>
          </div>

          <section className="rounded-3xl border border-[#d4af37]/18 bg-black/25 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d365]">
                  Próximos
                </p>
                <h2 className="text-base font-black uppercase tracking-[0.14em]">
                  Partidos programados
                </h2>
              </div>

              <span className="rounded-full border border-[#d4af37]/20 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#f6d365]">
                {scheduledMatches.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {scheduledMatches.map((match) => (
                <article
                  key={match.id}
                  className="rounded-2xl border border-white/8 bg-black/25 p-4 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#d4af37]/20 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                          {match.competition}
                        </span>

                        <span className="rounded-full border border-[#d4af37]/20 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-200">
                          Programado
                        </span>
                      </div>

                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-300">
                        {formatMatchDate(match.match_date)}
                      </p>

                      <h3 className="mt-2 flex flex-wrap items-center gap-2 text-lg font-black sm:text-xl">
                        <TeamLabel name={match.home_team} />
                        <span className="text-[#f6d365]">vs</span>
                        <TeamLabel name={match.away_team} />
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-[#d4af37]/15 bg-black/25 px-5 py-3 text-center backdrop-blur-md">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                        Resultado
                      </p>
                      <p className="text-2xl font-black text-white">- : -</p>
                    </div>
                  </div>
                </article>
              ))}

              {scheduledMatches.length === 0 && (
                <p className="rounded-2xl border border-white/8 bg-black/25 px-4 py-4 text-sm text-zinc-300 backdrop-blur-md">
                  No hay partidos programados.
                </p>
              )}
            </div>
          </section>

          <section className="mt-5 rounded-3xl border border-[#d4af37]/18 bg-black/25 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d365]">
                  Resultados
                </p>
                <h2 className="text-base font-black uppercase tracking-[0.14em]">
                  Partidos finalizados
                </h2>
              </div>

              <span className="rounded-full border border-emerald-500/20 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                {finishedMatches.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {finishedMatches.map((match) => (
                <article
                  key={match.id}
                  className="rounded-2xl border border-white/8 bg-black/25 p-4 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#d4af37]/20 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                          {match.competition}
                        </span>

                        <span className="rounded-full border border-emerald-500/20 bg-emerald-950/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                          Finalizado
                        </span>
                      </div>

                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-300">
                        {formatMatchDate(match.match_date)}
                      </p>

                      <h3 className="mt-2 flex flex-wrap items-center gap-2 text-lg font-black sm:text-xl">
                        <TeamLabel name={match.home_team} />
                        <span className="text-[#f6d365]">vs</span>
                        <TeamLabel name={match.away_team} />
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-[#d4af37]/15 bg-black/25 px-5 py-3 text-center backdrop-blur-md">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                        Resultado
                      </p>

                      <p className="text-2xl font-black text-white">
                        {match.home_score !== null && match.away_score !== null
                          ? `${match.home_score} : ${match.away_score}`
                          : "- : -"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              {finishedMatches.length === 0 && (
                <p className="rounded-2xl border border-white/8 bg-black/25 px-4 py-4 text-sm text-zinc-300 backdrop-blur-md">
                  Todavía no hay partidos finalizados.
                </p>
              )}
            </div>
          </section>
        </section>
      </main>
    </ProtectedRoute>
  );
}