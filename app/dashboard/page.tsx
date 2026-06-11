"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { calculateScore } from "@/lib/scoreCalculator";
import TeamLabel from "@/components/TeamLabel";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_id: string;
};

type Group = {
  id: string;
  name: string;
  code: string;
  owner_id: string | null;
  created_at: string;
};

type DashboardStats = {
  groups: number;
  points: number;
  exacts: number;
  predictions: number;
  bestPosition: number | null;
};

type RecentPrediction = {
  id: string;
  home_team: string;
  away_team: string;
  predicted_home_score: number;
  predicted_away_score: number;
  home_score: number | null;
  away_score: number | null;
  status: string;
};

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

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<RecentPrediction[]>(
    []
  );
  const [stats, setStats] = useState<DashboardStats>({
    groups: 0,
    points: 0,
    exacts: 0,
    predictions: 0,
    bestPosition: null,
  });
  const [message, setMessage] = useState("");

  const fetchDashboardData = useCallback(async () => {
    await Promise.resolve();
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No se pudo identificar el usuario.");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_id")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(profileData ?? null);

    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    const groupIds = memberships?.map((item) => item.group_id) ?? [];

    let userGroups: Group[] = [];

    if (groupIds.length > 0) {
      const { data: groupsData } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds)
        .order("created_at", { ascending: false });

      userGroups = groupsData ?? [];
    }

    setGroups(userGroups);

    const { data: scoreData } = await supabase
      .from("group_scores")
      .select("group_id, user_id, points, exacts")
      .eq("user_id", user.id);

    const totalPoints =
      scoreData?.reduce((sum, row) => sum + (row.points ?? 0), 0) ?? 0;

    const totalExacts =
      scoreData?.reduce((sum, row) => sum + (row.exacts ?? 0), 0) ?? 0;

    let bestPosition: number | null = null;

    for (const groupId of groupIds) {
      const { data: groupScores } = await supabase
        .from("group_scores")
        .select("user_id, points, exacts")
        .eq("group_id", groupId)
        .order("points", { ascending: false })
        .order("exacts", { ascending: false });

      const position =
        groupScores?.findIndex((score) => score.user_id === user.id) ?? -1;

      if (position >= 0) {
        const realPosition = position + 1;

        if (bestPosition === null || realPosition < bestPosition) {
          bestPosition = realPosition;
        }
      }
    }

    const { count: predictionCount } = await supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: recentPredictionData } = await supabase
      .from("predictions")
      .select(
        `
        id,
        predicted_home_score,
        predicted_away_score,
        matches (
          home_team,
          away_team,
          home_score,
          away_score,
          status
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);

    const formattedRecent =
      recentPredictionData?.map((item: {
        id: string;
        predicted_home_score: number;
        predicted_away_score: number;
        matches: { home_team: string; away_team: string; home_score: number | null; away_score: number | null; status: string }[] | { home_team: string; away_team: string; home_score: number | null; away_score: number | null; status: string } | null;
      }) => {
        const match = Array.isArray(item.matches) ? item.matches[0] : item.matches;
        return {
          id: item.id,
          predicted_home_score: item.predicted_home_score,
          predicted_away_score: item.predicted_away_score,
          home_team: match?.home_team ?? "",
          away_team: match?.away_team ?? "",
          home_score: match?.home_score ?? null,
          away_score: match?.away_score ?? null,
          status: match?.status ?? "scheduled",
        };
      }) ?? [];

    setRecentPredictions(formattedRecent);

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true })
      .limit(5);

    setMatches(matchesData ?? []);

    setStats({
      groups: userGroups.length,
      points: totalPoints,
      exacts: totalExacts,
      predictions: predictionCount ?? 0,
      bestPosition,
    });
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
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  return (
    <ProtectedRoute>
      <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
        <Sidebar />

        <div className="absolute inset-0">
          <Image
            src="/fondo-prodemundi.png"
            alt="Background"
            fill
            priority
            className="object-cover object-center opacity-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/55" />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 xl:pl-[320px] xl:pt-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#d4af37]">
            PRODEMUNDI Social
          </p>

          <h1 className="mb-3 font-[family-name:var(--font-cinzel)] text-3xl font-black leading-tight xl:text-4xl">
            Inicio
          </h1>

          <p className="mb-6 max-w-2xl text-sm leading-6 text-zinc-400">
            Bienvenido
            {profile?.display_name ? `, ${profile.display_name}` : ""}. Revisá
            tus grupos, próximos partidos, pronósticos recientes y evolución en
            la competencia.
          </p>

          {message && (
            <p className="mb-5 rounded-2xl border border-[#d4af37]/20 bg-black/45 px-4 py-3 text-sm text-[#f6d365]">
              {message}
            </p>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#d4af37]/15 bg-black/55 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Grupos activos
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {stats.groups}
              </p>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/15 bg-black/55 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Puntos
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {stats.points}
              </p>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/15 bg-black/55 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Exactos
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {stats.exacts}
              </p>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/15 bg-black/55 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Mejor posición
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {stats.bestPosition ? `${stats.bestPosition}°` : "-"}
              </p>
            </div>
          </div>

          {/* Guía rápida (ubicada al final según orden sugerido) */}
          <div className="mt-6 rounded-3xl border border-[#d4af37]/15 bg-black/55 p-5 backdrop-blur-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37]">
                  Guía rápida
                </p>

                <h2 className="text-base font-black uppercase tracking-[0.14em]">
                  ¿Nuevo en PRODEMUNDI?
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  Conocé cómo funcionan los grupos, los pronósticos, la
                  puntuación, los playoffs y las distinciones.
                </p>
              </div>

              <Link
                href="/dashboard/ayuda"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d4af37]/30 bg-gradient-to-r from-[#7f1d1d] to-[#260707] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:border-[#f6d365]/60"
              >
                Ver guía
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/55 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37]">
                    Competencia
                  </p>
                  <h2 className="text-base font-black uppercase tracking-[0.14em]">
                    Mis grupos
                  </h2>
                </div>

                <Link
                  href="/dashboard/grupos"
                  className="rounded-xl border border-[#d4af37]/30 bg-black/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#f6d365] transition hover:border-[#f6d365]/60 hover:text-white"
                >
                  Ver grupos
                </Link>
              </div>

              {groups.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-black/30 px-5 py-6">
                  <p className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-white">
                    Todavía no participás en ningún grupo
                  </p>

                  <p className="mb-4 text-sm leading-6 text-zinc-400">
                    Creá un grupo o ingresá un código para empezar a competir.
                  </p>

                  <Link
                    href="/dashboard/grupos"
                    className="inline-flex min-h-10 items-center rounded-xl border border-[#d4af37]/30 bg-gradient-to-r from-[#7f1d1d] to-[#260707] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white"
                  >
                    Ir a grupos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {groups.slice(0, 4).map((group) => (
                    <div
                      key={group.id}
                      className="rounded-2xl border border-white/5 bg-black/30 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#d4af37]">
                            Código: {group.code}
                          </p>

                          <h3 className="truncate text-lg font-black text-white">
                            {group.name}
                          </h3>
                        </div>

                        <Link
                          href={`/dashboard/grupos/${group.id}`}
                          className="inline-flex min-h-10 items-center rounded-xl border border-[#d4af37]/30 bg-black/40 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#f6d365] transition hover:border-[#f6d365]/60 hover:text-white"
                        >
                          Entrar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/55 p-5 backdrop-blur-md">
              <h2 className="mb-4 text-base font-black uppercase tracking-[0.14em]">
                Últimos pronósticos
              </h2>

              {recentPredictions.length === 0 ? (
                <p className="rounded-2xl border border-white/5 bg-black/30 px-4 py-4 text-sm text-zinc-400">
                  Todavía no realizaste pronósticos.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPredictions.map((prediction) => {
                    const isFinished = prediction.status === "finished";

                    let exact = false;
                    let correctResult = false;

                    if (isFinished) {
                      const { points: scorePoints, exact: isExact } = calculateScore(
                        prediction.predicted_home_score,
                        prediction.predicted_away_score,
                        prediction.home_score ?? 0,
                        prediction.away_score ?? 0
                      );
                      exact = isExact;
                      correctResult = scorePoints === 3;
                    }

                    return (
                      <div
                        key={prediction.id}
                        className="rounded-2xl border border-white/5 bg-black/30 p-4"
                      >
                        <p className="font-bold text-white">
                          <TeamLabel name={prediction.home_team} /> vs <TeamLabel name={prediction.away_team} />
                        </p>

                        <p className="mt-1 text-sm text-[#f6d365]">
                          Pronóstico: {prediction.predicted_home_score} :{" "}
                          {prediction.predicted_away_score}
                        </p>

                        {isFinished ? (
                          <p
                            className={`mt-2 text-xs font-black uppercase tracking-[0.14em] ${
                              exact
                                ? "text-[#f6d365]"
                                : correctResult
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {exact
                              ? "🎯 Exacto · +5 pts"
                              : correctResult
                              ? "🎱 Acierto · +3 pts"
                              : "❌ Sin acierto · +0 pts"}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                            Pendiente
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-md">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37]">
              Fixture
            </p>

            <h2 className="mb-4 text-base font-black uppercase tracking-[0.14em]">
              Próximos partidos
            </h2>

            {matches.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-black/30 px-4 py-4 text-sm text-zinc-400">
                Todavía no hay partidos cargados.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {matches.slice(0, 4).map((match) => (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-white/5 bg-black/30 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f6d365]">
                        {match.competition}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                        {match.status === "finished"
                          ? "Finalizado"
                          : "Programado"}
                      </span>
                    </div>

                    <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
                      {formatMatchDate(match.match_date)}
                    </p>

                    <p className="mt-1 font-black text-white">
                      <TeamLabel name={match.home_team} />{" "}
                      <span className="text-[#f6d365]">vs</span>{" "}
                      <TeamLabel name={match.away_team} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}