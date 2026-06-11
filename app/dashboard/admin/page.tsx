"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  scores_calculated: boolean;
};

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState("");
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [competition, setCompetition] = useState("Mundial");
  const [matchDate, setMatchDate] = useState("");

  async function checkAdminRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCheckingRole(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setAuthorized(data?.role === "admin");
    setCheckingRole(false);
  }

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMatches(data ?? []);
  }

  async function createMatch() {
    setMessage("");

    if (!homeTeam.trim() || !awayTeam.trim() || !matchDate.trim()) {
      setMessage("Completá equipo local, visitante y fecha.");
      return;
    }

    const cleanHome = homeTeam.trim();
const cleanAway = awayTeam.trim();

if (cleanHome.toLowerCase() === cleanAway.toLowerCase()) {
  setMessage("El equipo local y visitante no pueden ser iguales.");
  return;
}

const matchDateValue = new Date(matchDate);

if (matchDateValue.getTime() < Date.now()) {
  setMessage("La fecha del partido debe ser futura.");
  return;
}

    setCreating(true);

    const { error } = await supabase.from("matches").insert({
      home_team: cleanHome,
      away_team: cleanAway,
      competition: competition.trim() || "Mundial",
      match_date: new Date(matchDate).toISOString(),
      status: "scheduled",
      home_score: null,
      away_score: null,
      scores_calculated: false,
    });

    setCreating(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setHomeTeam("");
    setAwayTeam("");
    setCompetition("Mundial");
    setMatchDate("");
    setMessage("Partido creado correctamente.");
    fetchMatches();
  }

  function updateLocalMatch(
    matchId: string,
    field: "home_score" | "away_score" | "status",
    value: string
  ) {
    setMatches((current) =>
      current.map((match) => {
        if (match.id !== matchId) return match;

        if (field === "status") {
          return { ...match, status: value };
        }

        return {
          ...match,
          [field]: value === "" ? null : Number(value),
        };
      })
    );
  }

  async function saveResult(match: Match) {
  setMessage("");

  if (
    match.status === "finished" &&
    (match.home_score === null || match.away_score === null)
  ) {
    setMessage("Para finalizar un partido, cargá ambos resultados.");
    return;
  }

  if (
    match.home_score !== null &&
    match.home_score < 0
  ) {
    setMessage("El resultado local no puede ser negativo.");
    return;
  }

  if (
    match.away_score !== null &&
    match.away_score < 0
  ) {
    setMessage("El resultado visitante no puede ser negativo.");
    return;
  }

  setSavingMatchId(match.id);

  const { error: updateError } = await supabase
    .from("matches")
    .update({
      home_score: match.home_score,
      away_score: match.away_score,
      status: match.status,
    })
    .eq("id", match.id);

  if (updateError) {
    setSavingMatchId(null);
    setMessage(updateError.message);
    return;
  }

  const { error: recalculateError } = await supabase.rpc(
    "recalculate_all_scores"
  );

  setSavingMatchId(null);

  if (recalculateError) {
    setMessage(recalculateError.message);
    return;
  }

  setMessage("Resultado guardado y ranking recalculado.");
  fetchMatches();
}

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
      checkAdminRole();
      fetchMatches();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (checkingRole) {
    return null;
  }

  if (!authorized) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6d365]">
            Acceso restringido
          </p>
        </main>
      </ProtectedRoute>
    );
  }

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
            Panel interno
          </p>

          <h1 className="mb-3 font-[family-name:var(--font-cinzel)] text-3xl font-black leading-tight xl:text-4xl">
            Administración
          </h1>

          <p className="mb-6 max-w-2xl text-sm leading-6 text-zinc-400">
            Gestioná el fixture, cargá resultados y recalculá rankings.
          </p>

          {message && (
            <p className="mb-5 rounded-2xl border border-[#d4af37]/20 bg-black/45 px-4 py-3 text-sm text-[#f6d365]">
              {message}
            </p>
          )}

          <div className="mb-6 rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d365]">
              Fixture
            </p>

            <h2 className="mb-4 text-base font-black uppercase tracking-[0.14em]">
              Crear partido
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="Equipo local"
                className="min-h-10 rounded-xl border border-[#d4af37]/20 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f6d365]"
              />

              <input
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="Equipo visitante"
                className="min-h-10 rounded-xl border border-[#d4af37]/20 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f6d365]"
              />

              <input
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                placeholder="Competencia"
                className="min-h-10 rounded-xl border border-[#d4af37]/20 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f6d365]"
              />
              <input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="min-h-10 rounded-xl border border-[#d4af37]/20 bg-black/35 px-3 text-sm text-white outline-none focus:border-[#f6d365]"
              />
              <button
                type="button"
                onClick={createMatch}
                disabled={creating}
                className="min-h-10 w-full rounded-xl border border-[#d4af37]/30 bg-black/40 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/18 bg-black/25 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d365]">
                  Operación
                </p>
                <h2 className="text-base font-black uppercase tracking-[0.14em]">
                  Partidos cargados
                </h2>
              </div>

              <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#f6d365]">
                {matches.length} partidos
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-2xl border border-white/8 bg-black/25 p-4 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                          {match.competition}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                            match.status === "finished"
                              ? "border-emerald-500/20 bg-emerald-950/30 text-emerald-300"
                              : "border-[#d4af37]/20 bg-white/[0.04] text-zinc-300"
                          }`}
                        >
                          {match.status === "finished"
                            ? "Finalizado"
                            : "Programado"}
                        </span>
                      </div>

                      <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                        {formatMatchDate(match.match_date)}
                      </p>

                      <h3 className="mt-1 text-lg font-black sm:text-xl">
                        <TeamLabel name={match.home_team} />{" "}
                        <span className="text-[#f6d365]">vs</span>{" "}
                        <TeamLabel name={match.away_team} />
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
                      <input
                        type="number"
                        min="0"
                        value={match.home_score ?? ""}
                        onChange={(e) =>
                          updateLocalMatch(
                            match.id,
                            "home_score",
                            e.target.value
                          )
                        }
                        className="h-11 w-12 rounded-2xl border border-[#d4af37]/25 bg-[#090909]/70 text-center text-lg font-black text-[#f6d365] outline-none focus:border-[#f6d365]"
                      />

                      <span className="text-lg font-black text-[#d4af37]">
                        :
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={match.away_score ?? ""}
                        onChange={(e) =>
                          updateLocalMatch(
                            match.id,
                            "away_score",
                            e.target.value
                          )
                        }
                        className="h-11 w-12 rounded-2xl border border-[#d4af37]/25 bg-[#090909]/70 text-center text-lg font-black text-[#f6d365] outline-none focus:border-[#f6d365]"
                      />

                      <select
                        value={match.status}
                        onChange={(e) =>
                          updateLocalMatch(match.id, "status", e.target.value)
                        }
                        className="h-10 rounded-xl border border-[#d4af37]/20 bg-black/35 px-3 text-xs font-bold text-white outline-none"
                      >
                        <option value="scheduled">Programado</option>
                        <option value="finished">Finalizado</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => saveResult(match)}
                        disabled={savingMatchId === match.id}
                        className="min-h-10 whitespace-nowrap rounded-xl border border-[#d4af37]/30 bg-black/40 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white disabled:opacity-50"
                      >
                        {savingMatchId === match.id
                          ? "Guardando..."
                          : "Guardar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {matches.length === 0 && (
                <p className="rounded-2xl border border-white/5 bg-black/30 px-4 py-4 text-sm text-zinc-400">
                  Todavía no hay partidos cargados.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}