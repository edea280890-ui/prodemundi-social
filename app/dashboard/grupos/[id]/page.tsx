"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { calculateScore } from "@/lib/scoreCalculator";
import TeamLabel from "@/components/TeamLabel";

type Group = {
  id: string;
  name: string;
  code: string;
  owner_id: string | null;
  created_at: string;
};

type MemberProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_id: string;
};


type GroupScore = {
  user_id: string;
  points: number;
  exacts: number;
  profile?: MemberProfile;
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
  scores_calculated: boolean;
};

type Prediction = {
  id?: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
};

type GroupPrediction = Prediction & {
  user_id: string;
  profile?: MemberProfile;
};

export default function GroupDetailPage() {
  const params = useParams();

  const groupId =
    typeof params.id === "string"
      ? params.id
      : typeof params.groupId === "string"
      ? params.groupId
      : "";

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [scores, setScores] = useState<GroupScore[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [allPredictions, setAllPredictions] = useState<
    Record<string, GroupPrediction[]>
  >({});
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [savedMatchId, setSavedMatchId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  function isPredictionClosed(matchDate: string, now: number) {
    const matchTime = new Date(matchDate).getTime();
    const closeTime = matchTime - 30 * 60 * 1000;
    return now >= closeTime;
  }

  function getMatchStatus(matchDate: string, now: number) {
    const matchTime = new Date(matchDate).getTime();
    const closeTime = matchTime - 30 * 60 * 1000;
    const minutesToClose = Math.floor((closeTime - now) / 1000 / 60);
    const minutesToMatch = Math.floor((matchTime - now) / 1000 / 60);

    if (minutesToClose <= 0) {
      return {
        label: "Cerrado",
        className: "border-red-500/20 bg-red-950/30 text-red-300",
      };
    }

    if (minutesToClose <= 30) {
      return {
        label: `Cierra en ${minutesToClose}m`,
        className: "border-amber-500/20 bg-amber-950/30 text-amber-300",
      };
    }

    if (minutesToMatch <= 180) {
      return {
        label: "Disponible",
        className: "border-emerald-500/20 bg-emerald-950/30 text-emerald-300",
      };
    }

    return {
      label: "Programado",
      className: "border-[#d4af37]/20 bg-[#d4af37]/10 text-[#f6d365]",
    };
  }

  function getPredictionResult(match: Match, prediction?: Prediction) {
    if (
      match.status !== "finished" ||
      match.home_score === null ||
      match.away_score === null ||
      !prediction
    ) {
      return null;
    }

    const { points, exact } = calculateScore(
      prediction.predicted_home_score,
      prediction.predicted_away_score,
      match.home_score,
      match.away_score
    );

    if (exact) {
      return {
        label: "? Exacto acertado",
        points: "+5 pts",
        className: "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f6d365]",
      };
    }

    if (points === 3) {
      return {
        label: "? Ganador acertado",
        points: "+3 pts",
        className: "border-emerald-500/20 bg-emerald-950/30 text-emerald-300",
      };
    }

    return {
      label: "Sin acierto",
      points: "+0 pts",
      className: "border-red-500/20 bg-red-950/30 text-red-300",
    };
  }

  function formatMatchDate(matchDate: string) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(matchDate));
  }

  const fetchGroupDetail = useCallback(async () => {
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupError) {
      setMessage(groupError.message);
      return;
    }

    setGroup(groupData);

    const { data: memberships, error: membershipsError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (membershipsError) {
      setMessage(membershipsError.message);
      return;
    }

    const userIds = memberships?.map((item) => item.user_id) ?? [];

    if (userIds.length === 0) {
      setMembers([]);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_id")
      .in("id", userIds);

    if (profilesError) {
      setMessage(profilesError.message);
      return;
    }

    setMembers(profiles ?? []);
  }, [groupId]);

  const fetchGroupScores = useCallback(async () => {
  const { data: scoreData, error: scoreError } = await supabase
    .from("group_scores")
    .select("user_id, points, exacts")
    .eq("group_id", groupId)
    .order("points", { ascending: false })
    .order("exacts", { ascending: false });

  if (scoreError) {
    setMessage(scoreError.message);
    return;
  }

  const userIds = scoreData?.map((score) => score.user_id) ?? [];

  if (userIds.length === 0) {
    setScores([]);
    return;
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_id")
    .in("id", userIds);

  if (profilesError) {
    setMessage(profilesError.message);
    return;
  }

  const scoresWithProfiles =
    scoreData?.map((score) => ({
      ...score,
      profile: profiles?.find((profile) => profile.id === score.user_id),
    })) ?? [];

  setScores(scoresWithProfiles);
}, [groupId]);

  const fetchMatchesAndPredictions = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });

    if (matchesError) {
      setMessage(matchesError.message);
      return;
    }

    setMatches(matchesData ?? []);

    const { data: predictionData, error: predictionError } = await supabase
      .from("predictions")
      .select("*")
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (predictionError) {
      setMessage(predictionError.message);
      return;
    }

    const formattedPredictions: Record<string, Prediction> = {};

    predictionData?.forEach((prediction) => {
      formattedPredictions[prediction.match_id] = prediction;
    });

    setPredictions(formattedPredictions);

    const { data: groupPredictionData, error: groupPredictionError } =
      await supabase.from("predictions").select("*").eq("group_id", groupId);

    if (groupPredictionError) {
      setAllPredictions({});
      return;
    }

    const predictionUserIds = [
      ...new Set(
        groupPredictionData?.map((prediction) => prediction.user_id) ?? []
      ),
    ];

    let predictionProfiles: MemberProfile[] = [];

    if (predictionUserIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_id")
        .in("id", predictionUserIds);

      predictionProfiles = profilesData ?? [];
    }

    const formattedGroupPredictions: Record<string, GroupPrediction[]> = {};

    groupPredictionData?.forEach((prediction) => {
      const matchPredictions =
        formattedGroupPredictions[prediction.match_id] ?? [];

      matchPredictions.push({
        ...prediction,
        profile: predictionProfiles.find(
          (profile) => profile.id === prediction.user_id
        ),
      });

      formattedGroupPredictions[prediction.match_id] = matchPredictions;
    });

    setAllPredictions(formattedGroupPredictions);
  }, [groupId]);

  function updateLocalPrediction(
    matchId: string,
    field: "predicted_home_score" | "predicted_away_score",
    value: string
  ) {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue) || numericValue < 0) return;

    setPredictions((current) => ({
      ...current,
      [matchId]: {
        id: current[matchId]?.id,
        match_id: matchId,
        predicted_home_score:
          field === "predicted_home_score"
            ? numericValue
            : current[matchId]?.predicted_home_score ?? 0,
        predicted_away_score:
          field === "predicted_away_score"
            ? numericValue
            : current[matchId]?.predicted_away_score ?? 0,
      },
    }));
  }

  async function savePrediction(match: Match) {
    setMessage("");

    if (!userId) {
      setMessage("No se pudo identificar el usuario.");
      return;
    }

    if (isPredictionClosed(match.match_date, now)) {
      setMessage("Este pronóstico ya está cerrado.");
      return;
    }

    const prediction = predictions[match.id];

    if (!prediction) {
      setMessage("Cargá ambos resultados antes de guardar.");
      return;
    }

    setSavingMatchId(match.id);

    const { error } = await supabase.from("predictions").upsert(
      {
        group_id: groupId,
        match_id: match.id,
        user_id: userId,
        predicted_home_score: prediction.predicted_home_score,
        predicted_away_score: prediction.predicted_away_score,
      },
      {
        onConflict: "group_id,match_id,user_id",
      }
    );

    setSavingMatchId(null);

    if (error) {
      setSavedMatchId(null);
      setMessage(error.message);
      return;
    }

    setMessage("Pronóstico guardado correctamente.");
    fetchMatchesAndPredictions();
    setSavedMatchId(match.id);

    setTimeout(() => {
      setSavedMatchId((current) => (current === match.id ? null : current));
    }, 2000);
  }
async function leaveGroup() {
  if (!groupId) return;

  const confirmLeave = window.confirm(
    "¿Seguro que querés salir de este grupo? Si volvés a ingresar, comenzarás desde cero."
  );

  if (!confirmLeave) return;

  const { error } = await supabase.rpc("leave_group", {
    p_group_id: groupId,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  window.location.href = "/dashboard/grupos";
}
async function deleteGroup() {
  if (!groupId) return;

  const confirmDelete = window.confirm(
    "¿Seguro que querés eliminar este grupo? Esta acción no se puede deshacer."
  );

  if (!confirmDelete) return;

  const { error } = await supabase.rpc("delete_group", {
    p_group_id: groupId,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  window.location.href = "/dashboard/grupos";
}

  useEffect(() => {
    if (!groupId) {
      setTimeout(() => {
        setMessage("No se encontró el ID del grupo en la URL.");
      }, 0);
      return;
    }

    const timer = setTimeout(() => {
      fetchGroupDetail();
      fetchGroupScores();
      fetchMatchesAndPredictions();
    }, 0);

    const channel = supabase
      .channel(`group-realtime-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_scores",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchGroupDetail();
          fetchGroupScores();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchGroupDetail();
          fetchGroupScores();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "predictions",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchMatchesAndPredictions();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatchesAndPredictions();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchGroupDetail, fetchGroupScores, fetchMatchesAndPredictions]);

const leader = scores[0];
const finishedMatchesCount = matches.filter(
  (match) => match.status === "finished"
).length;
const pendingMatchesCount = matches.filter(
  (match) => match.status !== "finished"
).length;
const currentUserPosition = scores.findIndex(
  (score) => score.user_id === userId
);

const currentUserScore =
  currentUserPosition >= 0 ? scores[currentUserPosition] : null;

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
          <Link
            href="/dashboard/grupos"
            className="mb-8 inline-flex text-xs font-black uppercase tracking-[0.18em] text-[#f6d365] transition hover:text-white"
          >
            ← Volver a grupos
          </Link>

          {message && (
            <p className="mb-6 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/80">
              {message}
            </p>
          )}

          <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="mb-4 inline-block rounded-lg border border-white/15 bg-white/10 px-3 py-1">
                <p className="text-[10px] font-black uppercase tracking-[0.30em] text-white">
                  Torneo en vivo
                </p>
              </div>

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <h1 className="font-[family-name:var(--font-cinzel)] text-4xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] lg:text-5xl">
                    {group?.name ||
                      (groupId ? "Buscando grupo..." : "No se recibió ID del grupo")}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-left sm:justify-end sm:text-right">
                  <div className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                    {group?.code || "..."}
                  </div>

                  <button
                    type="button"
                    onClick={leaveGroup}
                    className="rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:border-white/20 hover:text-white"
                  >
                    Salir
                  </button>

                  {group?.owner_id === userId && (
                    <button
                      type="button"
                      onClick={deleteGroup}
                      className="rounded-lg border border-red-500/25 bg-red-950/15 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-red-400 transition hover:border-red-400/60 hover:text-red-200"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/15"></div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.20em] text-white/70">
                  🏆 Líder
                </p>
                <p className="mt-2 truncate text-base font-black text-white lg:text-lg">
                  {leader?.profile?.display_name || "—"}
                </p>
                <p className="mt-1 text-xs font-bold text-[#f6d365]">
                  {leader ? `${leader.points} PTS` : "0 PTS"}
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/15"></div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.20em] text-white/70">
                  👥 Participantes
                </p>
                <p className="mt-2 text-3xl font-black text-white lg:text-4xl">
                  {members.length}
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/15"></div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.20em] text-white/70">
                  ✓ Finalizados
                </p>
                <p className="mt-2 text-3xl font-black text-white lg:text-4xl">
                  {finishedMatchesCount}
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/15"></div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.20em] text-white/70">
                  ⏳ Pendientes
                </p>
                <p className="mt-2 text-3xl font-black text-white lg:text-4xl">
                  {pendingMatchesCount}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
          <div className="mb-6 rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70">
                  📊 Tabla Oficial
                </p>
                <h2 className="mt-2 text-xl font-black uppercase tracking-[0.12em] lg:text-2xl">
                  Posiciones
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Actualización en tiempo real
                </p>
              </div>

              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white">
                {scores.length} jugadores
              </span>
            </div>

            {currentUserScore && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[8px] font-black uppercase tracking-[0.20em] text-white/70">
                  Tu posición
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6d365]/15 text-sm font-black text-[#f6d365]">
                      {currentUserPosition + 1}
                    </div>
                    <p className="text-sm text-zinc-300">
                      {currentUserScore.points} PTS • {currentUserScore.exacts} exactos
                    </p>
                  </div>
                  {currentUserPosition > 0 && (
                    <p className="text-xs font-black text-red-300">
                      -{scores[0].points - currentUserScore.points} pts
                    </p>
                  )}
                </div>
              </div>
            )}

            {scores.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-black/30 px-4 py-4 text-sm text-zinc-400">
                Todavía no hay tabla de posiciones para este grupo.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {scores.slice(0, 3).map((score, index) => {
                    const isCurrentUser = score.user_id === userId;
                    const leaderPoints = scores[0]?.points ?? 0;
                    const pointsBehind = leaderPoints - score.points;

                    const podiumConfig =
                      index === 0
                        ? {
                            medal: "🥇",
                            border: "border-white/15",
                            bg: "bg-white/5",
                            shadow: "shadow-none",
                          }
                        : index === 1
                        ? {
                            medal: "🥈",
                            border: "border-white/15",
                            bg: "bg-white/5",
                            shadow: "shadow-none",
                          }
                        : {
                            medal: "🥉",
                            border: "border-white/15",
                            bg: "bg-white/5",
                            shadow: "shadow-none",
                          };

                    return (
                      <div
                        key={score.user_id}
                        className={`flex items-center justify-between rounded-2xl border px-3 py-3 transition ${
                          isCurrentUser
                            ? "border-white/15 bg-white/5 shadow-none"
                            : `${podiumConfig.border} ${podiumConfig.bg} ${podiumConfig.shadow}`
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="text-lg">{podiumConfig.medal}</div>

                          <Image
                            src={`/avatars/${
                              score.profile?.avatar_id || "avatar_01"
                            }.png`}
                            alt={score.profile?.display_name || "Usuario"}
                            width={48}
                            height={48}
                            className="h-10 w-auto shrink-0 object-contain"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-white">
                              {score.profile?.display_name || "Usuario"}
                            </p>
                            <p className="text-[10px] text-[#f6d365]">
                              @{score.profile?.username}
                            </p>
                          </div>
                        </div>

                        <div className="ml-2 flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xl font-black text-white">
                              {score.points}
                            </p>
                            <p className="text-[8px] uppercase text-zinc-500">
                              PTS
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-black text-[#f6d365]">
                              {score.exacts}
                            </p>
                            <p className="text-[8px] uppercase text-zinc-500">
                              exactos
                            </p>
                          </div>

                          {pointsBehind > 0 && (
                            <p className="text-[10px] font-black text-red-300 whitespace-nowrap">
                              -{pointsBehind}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {scores.length > 3 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.20em] text-zinc-600 px-2">
                      Resto de la tabla
                    </p>

                    {scores.slice(3).map((score, index) => {
                      const isCurrentUser = score.user_id === userId;
                      const leaderPoints = scores[0]?.points ?? 0;
                      const pointsBehind = leaderPoints - score.points;

                      return (
                        <div
                          key={score.user_id}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
                            isCurrentUser
                              ? "border-white/15 bg-white/5 shadow-none"
                              : "border-white/8 bg-black/40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[9px] font-black text-zinc-500">
                              {index + 4}
                            </div>

                            <Image
                              src={`/avatars/${
                                score.profile?.avatar_id || "avatar_01"
                              }.png`}
                              alt={score.profile?.display_name || "Usuario"}
                              width={48}
                              height={48}
                              className="h-9 w-auto shrink-0 object-contain"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-white">
                                {score.profile?.display_name}
                              </p>
                            </div>
                          </div>

                          <div className="ml-2 flex items-center gap-2 shrink-0 text-right">
                            <div>
                              <p className="text-sm font-black text-white">
                                {score.points}
                              </p>
                              <p className="text-[8px] text-zinc-500">
                                {score.exacts}x
                              </p>
                            </div>
                            {pointsBehind > 0 && (
                              <p className="text-[9px] font-black text-red-300">
                                -{pointsBehind}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
<div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-md">
            <div className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d4af37]/80">
                🏆 Distinciones
              </p>

              <h2 className="mt-2 text-xl font-black uppercase tracking-[0.12em] lg:text-2xl">
                Premios del grupo
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Distinciones que se otorgarán al finalizar la competencia.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-4">
                <p className="text-sm font-black text-[#f6d365]">
                  🏆 Campeón
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Primer puesto de la tabla final.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-black text-white">
                  🥈 Subcampeón
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Segundo puesto de la tabla final.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-black text-white">
                  🥉 Tercer puesto
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Tercer puesto de la competencia.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-black text-white">
                  🎯 Especialista
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Mayor cantidad de resultados exactos.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-black text-white">
                  🎱 Carambola
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Mayor cantidad de aciertos.
                </p>
              </div>

              <div className="rounded-2xl border border-red-500/15 bg-red-950/10 p-4">
                <p className="text-sm font-black text-red-300">
                  🫏 Burro
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Último puesto de la tabla final.
                </p>
              </div>

            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-md">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d4af37]/80">
                  ⚽ Gameplay
                </p>

                <h2 className="mt-2 text-xl font-black uppercase tracking-[0.12em] lg:text-2xl">
                  Próximos pronósticos
                </h2>

                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5">
                  <span className="text-sm font-black text-white">
                    {
                      matches.filter((match) => {
                        const closed = isPredictionClosed(match.match_date, now);
                        const finished = match.status === "finished";
                        const prediction = predictions[match.id];

                        return !closed && !finished && !prediction?.id;
                      }).length
                    }
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">
                    pendientes
                  </span>
                </div>
              </div>

              <p className="text-[13px] leading-relaxed text-zinc-500">
                Puedes editar tus pronósticos hasta 30 min antes de cada partido.
              </p>
            </div>

            <div className="space-y-3">
              {matches.map((match) => {
                const closed = isPredictionClosed(match.match_date, now);
                const prediction = predictions[match.id];
                const statusInfo = getMatchStatus(match.match_date, now);
                const predictionResult = getPredictionResult(match, prediction);

                return (
                  <div
                    key={match.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur transition hover:border-white/20 hover:bg-black/30 sm:p-4"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-r from-white/10 to-transparent transition"></div>

                    <div className="relative z-10 flex flex-col gap-4 lg:gap-5">
                      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-white">
                              {match.competition}
                            </span>

                            <span
                              className={`rounded-md border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] ${
                                match.status === "finished"
                                  ? match.scores_calculated
                                    ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
                                    : "border-blue-500/30 bg-blue-950/30 text-blue-300"
                                  : statusInfo.className
                              }`}
                            >
                              {match.status === "finished"
                                ? match.scores_calculated
                                  ? "Puntuado"
                                  : "Finalizado"
                                : statusInfo.label}
                            </span>
                          </div>

                          <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">
                            {formatMatchDate(match.match_date)}
                          </p>

                          <h3 className="mt-2.5 text-lg font-black sm:text-xl">
                            <TeamLabel name={match.home_team} />{" "}
                            <span className="text-[#f6d365]">vs</span>{" "}
                            <TeamLabel name={match.away_team} />
                          </h3>

                          {match.status === "finished" &&
                            match.home_score !== null &&
                            match.away_score !== null && (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2">
                                <span className="text-[10px] font-black uppercase text-zinc-400">
                                  Resultado
                                </span>

                                <span className="text-2xl font-black text-white">
                                  {match.home_score}
                                </span>

                                <span className="text-sm font-black text-[#d4af37]">
                                  :
                                </span>

                                <span className="text-2xl font-black text-white">
                                  {match.away_score}
                                </span>
                              </div>
                            )}
                        </div>

                        {match.status !== "finished" && (
                          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end lg:flex-row">
                            {closed && (
                              <div className="rounded-lg border border-red-500/25 bg-red-950/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-200">
                                🔒 Cerrado
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                disabled={closed}
                                value={prediction?.predicted_home_score ?? ""}
                                onChange={(event) =>
                                  updateLocalPrediction(
                                    match.id,
                                    "predicted_home_score",
                                    event.target.value
                                  )
                                }
                                className="h-10 w-14 rounded-lg border border-[#d4af37]/30 bg-black/50 text-center text-lg font-black text-white outline-none transition focus:border-[#f6d365] focus:ring-1 focus:ring-[#f6d365]/20 disabled:cursor-not-allowed disabled:border-red-500/20 disabled:bg-red-950/15 disabled:text-red-300 disabled:opacity-60"
                              />

                              <span className="text-zinc-600 font-bold">
                                –
                              </span>

                              <input
                                type="number"
                                min="0"
                                disabled={closed}
                                value={prediction?.predicted_away_score ?? ""}
                                onChange={(event) =>
                                  updateLocalPrediction(
                                    match.id,
                                    "predicted_away_score",
                                    event.target.value
                                  )
                                }
                                className="h-10 w-14 rounded-lg border border-[#d4af37]/30 bg-black/50 text-center text-lg font-black text-white outline-none transition focus:border-[#f6d365] focus:ring-1 focus:ring-[#f6d365]/20 disabled:cursor-not-allowed disabled:border-red-500/20 disabled:bg-red-950/15 disabled:text-red-300 disabled:opacity-60"
                              />
                            </div>

                            <button
                              type="button"
                              disabled={closed || savingMatchId === match.id}
                              onClick={() => savePrediction(match)}
                              className="min-h-10 w-full rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white transition hover:border-white/20 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                            >
                              {savingMatchId === match.id
                                ? "Guardando..."
                                : savedMatchId === match.id
                                ? "✓ Guardado"
                                : prediction?.id
                                ? "Actualizar"
                                : "Guardar"}
                            </button>
                          </div>
                        )}
                      </div>

                      {match.status === "finished" &&
                        prediction &&
                        predictionResult && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                            <div className="inline-flex items-center rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-300">
                              Tu pronóstico:
                              <span className="ml-2 text-[#f6d365]">
                                {prediction.predicted_home_score} :{" "}
                                {prediction.predicted_away_score}
                              </span>
                            </div>

                            <div
                              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] ${predictionResult.className}`}
                            >
                              {predictionResult.label}
                              <span className="ml-2">
                                {predictionResult.points}
                              </span>
                            </div>
                          </div>
                        )}

                      {match.status === "finished" && !prediction && (
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <div className="inline-flex items-center rounded-lg border border-zinc-600/30 bg-zinc-900/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400">
                            Sin pronóstico
                            <span className="ml-2">+0 pts</span>
                          </div>
                        </div>
                      )}

                      {closed && (
                        <div className="border-t border-white/8 pt-4">
                          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                            Pronósticos del grupo
                          </p>

                          {(allPredictions[match.id] ?? []).length === 0 ? (
                            <p className="rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-zinc-500">
                              Sin pronósticos cargados.
                            </p>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {(allPredictions[match.id] ?? []).map(
                                (groupPrediction) => {
                                  const groupPredictionResult =
                                    getPredictionResult(
                                      match,
                                      groupPrediction
                                    );

                                  const isCurrentUserPrediction =
                                    groupPrediction.user_id === userId;

                                  return (
                                    <div
                                      key={`${groupPrediction.match_id}-${groupPrediction.user_id}`}
                                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                                        isCurrentUserPrediction
                                          ? "border-white/15 bg-white/5 shadow-none"
                                          : groupPredictionResult
                                          ? groupPredictionResult.className
                                          : "border-white/8 bg-black/40 text-zinc-300"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Image
                                          src={`/avatars/${
                                            groupPrediction.profile
                                              ?.avatar_id || "avatar_01"
                                          }.png`}
                                          alt={
                                            groupPrediction.profile
                                              ?.display_name || "Usuario"
                                          }
                                          width={48}
                                          height={48}
                                          className="h-8 w-auto object-contain shrink-0"
                                        />

                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-[11px] font-bold text-white">
                                            {
                                              groupPrediction.profile
                                                ?.display_name
                                            }
                                          </p>

                                          {isCurrentUserPrediction && (
                                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#f6d365]">
                                              Vos
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="ml-2 flex items-center gap-2 shrink-0">
                                        <div className="rounded-md border border-white/15 bg-white/10 px-2 py-1 font-black text-white">
                                          {
                                            groupPrediction.predicted_home_score
                                          }
                                          :
                                          {
                                            groupPrediction.predicted_away_score
                                          }
                                        </div>

                                        {groupPredictionResult && (
                                          <p className="text-[8px] font-black">
                                            {groupPredictionResult.label ===
                                            "✓ Exacto acertado"
                                              ? "✓"
                                              : groupPredictionResult.label ===
                                                  "✓ Ganador acertado"
                                              ? "✓"
                                              : "✗"}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

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