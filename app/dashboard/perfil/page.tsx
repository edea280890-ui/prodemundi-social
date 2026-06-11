"use client";

import Image from "next/image";
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
  role?: string;
};

type ProfileStats = {
  points: number;
  exacts: number;
  predictions: number;
  bestPosition: number | null;
};

type PredictionHistoryItem = {
  id: string;
  home_team: string;
  away_team: string;
  predicted_home_score: number;
  predicted_away_score: number;
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_date: string;
};

const avatars = [
  "avatar_01",
  "avatar_02",
  "avatar_03",
  "avatar_04",
  "avatar_05",
  "avatar_06",
  "avatar_07",
  "avatar_08",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState("avatar_01");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<ProfileStats>({
    points: 0,
    exacts: 0,
    predictions: 0,
    bestPosition: null,
  });
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (userId: string) => {
    const { data: scores } = await supabase
      .from("group_scores")
      .select("group_id, user_id, points, exacts")
      .eq("user_id", userId);

    const { count } = await supabase
      .from("predictions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId);

    const totalPoints =
      scores?.reduce((sum, row) => sum + (row.points ?? 0), 0) ?? 0;

    const totalExacts =
      scores?.reduce((sum, row) => sum + (row.exacts ?? 0), 0) ?? 0;

    const groupIds = scores?.map((score) => score.group_id) ?? [];

    let bestPosition: number | null = null;

    for (const groupId of groupIds) {
      const { data: groupScores } = await supabase
        .from("group_scores")
        .select("user_id, points, exacts")
        .eq("group_id", groupId)
        .order("points", { ascending: false })
        .order("exacts", { ascending: false });

      const position =
        groupScores?.findIndex((score) => score.user_id === userId) ?? -1;

      if (position >= 0) {
        const realPosition = position + 1;

        if (bestPosition === null || realPosition < bestPosition) {
          bestPosition = realPosition;
        }
      }
    }

    setStats({
      points: totalPoints,
      exacts: totalExacts,
      predictions: count ?? 0,
      bestPosition,
    });
  }, []);

  const fetchHistory = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("predictions")
      .select(`
        id,
        predicted_home_score,
        predicted_away_score,
        matches (
          home_team,
          away_team,
          home_score,
          away_score,
          status,
          match_date
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) return;

    const formatted =
      data?.map((item: {
        id: string;
        predicted_home_score: number;
        predicted_away_score: number;
        matches: {
          home_team: string;
          away_team: string;
          home_score: number | null;
          away_score: number | null;
          status: string;
          match_date: string;
        }[] | {
          home_team: string;
          away_team: string;
          home_score: number | null;
          away_score: number | null;
          status: string;
          match_date: string;
        } | null;
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
          match_date: match?.match_date ?? "",
        };
      }) ?? [];

    setHistory(formatted);
  }, []);

  const fetchProfile = useCallback(async () => {
    await Promise.resolve();
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No se pudo identificar el usuario.");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data) {
      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: user.email?.split("@")[0] || "usuario",
          display_name: "Usuario",
          avatar_id: "avatar_01",
          role: "user",
        })
        .select("id, username, display_name, avatar_id, role")
        .single();

      if (createError) {
        setMessage(createError.message);
        return;
      }

      setProfile(createdProfile);
      setUsername(createdProfile.username);
      setDisplayName(createdProfile.display_name);
      setAvatarId(createdProfile.avatar_id);
      return;
    }

    setProfile(data);
    setUsername(data.username || "");
    setDisplayName(data.display_name || "");
    setAvatarId(data.avatar_id || "avatar_01");
    fetchStats(user.id);
    fetchHistory(user.id);
  }, [fetchStats, fetchHistory]);

  async function updateProfile() {
    setMessage("");

    if (!username.trim() || !displayName.trim()) {
      setMessage("Completá nombre visible y usuario.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setMessage("No se pudo identificar el usuario.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        avatar_id: avatarId,
      },
      {
        onConflict: "id",
      }
    );

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setMessage("Ese nombre de usuario ya está en uso.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    setMessage("Perfil actualizado correctamente.");
    fetchProfile();
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

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

        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6 xl:pl-[320px] xl:pt-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#f6d365]">
            Mi jugador
          </p>

          <h1 className="mb-3 font-[family-name:var(--font-cinzel)] text-3xl font-black leading-tight xl:text-4xl">
            Perfil
          </h1>

          <p className="mb-6 max-w-2xl text-sm leading-6 text-zinc-200">
            Editá tu identidad dentro de PRODEMUNDI y revisá tus últimos
            pronósticos.
          </p>

          {message && (
            <p className="mb-5 rounded-2xl border border-[#d4af37]/20 bg-black/35 px-4 py-3 text-sm text-[#f6d365] backdrop-blur-md">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl border border-[#d4af37]/18 bg-black/25 p-5 backdrop-blur-md">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-[210px] w-full items-center justify-center overflow-visible">
                  <Image
                    src={`/avatars/${avatarId}.png`}
                    alt="Avatar"
                    width={220}
                    height={220}
                    className="h-[205px] w-auto object-contain"
                  />
                </div>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {displayName || "Usuario"}
                </h2>

                <p className="mt-1 text-sm font-bold text-[#f6d365]">
                  @{username || "usuario"}
                </p>

                <div className="mt-5 grid w-full grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-3 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                      Puntos
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {stats.points}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-3 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                      Exactos
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {stats.exacts}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-3 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                      Pronósticos
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {stats.predictions}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-3 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                      Mejor pos.
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {stats.bestPosition ? `${stats.bestPosition}°` : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 w-full rounded-2xl border border-[#d4af37]/15 bg-black/20 p-3 text-left backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                    Promedio
                  </p>
                  <p className="mt-1 text-xl font-black text-white">
                    {stats.predictions > 0
                      ? (stats.points / stats.predictions).toFixed(1)
                      : "0.0"}{" "}
                    pts por pronóstico
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-[#d4af37]/18 bg-black/25 p-5 backdrop-blur-md">
                <h2 className="mb-4 text-base font-black uppercase tracking-[0.14em]">
                  Editar ficha
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
                      Nombre visible
                    </span>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="min-h-11 w-full rounded-xl border border-[#d4af37]/20 bg-black/35 px-3 text-sm text-white outline-none backdrop-blur-md placeholder:text-zinc-500 focus:border-[#f6d365]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
                      Usuario
                    </span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="min-h-11 w-full rounded-xl border border-[#d4af37]/20 bg-black/35 px-3 text-sm text-white outline-none backdrop-blur-md placeholder:text-zinc-500 focus:border-[#f6d365]"
                    />
                  </label>

                  <div>
                    <span className="mb-3 block text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
                      Elegí tu personaje
                    </span>

                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setAvatarId(avatar)}
                          className={`min-h-24 rounded-2xl border p-2 transition ${
                            avatarId === avatar
                              ? "border-[#f6d365] bg-[#d4af37]/15"
                              : "border-white/10 bg-black/20 hover:border-[#d4af37]/30"
                          }`}
                        >
                          <Image
                            src={`/avatars/${avatar}.png`}
                            alt={avatar}
                            width={80}
                            height={80}
                            className="mx-auto h-20 w-auto object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={updateProfile}
                    disabled={loading}
                    className="mt-2 min-h-11 rounded-xl border border-[#d4af37]/35 bg-black/40 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:border-[#f6d365]/70 hover:text-[#f6d365] disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Guardar perfil"}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-[#d4af37]/18 bg-black/25 p-5 backdrop-blur-md">
                <h2 className="mb-4 text-base font-black uppercase tracking-[0.14em]">
                  Últimos pronósticos
                </h2>

                {history.length === 0 ? (
                  <p className="text-sm text-zinc-300">
                    Todavía no realizaste pronósticos.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => {
                      const finished = item.status === "finished";

                      let label = "Pendiente";
                      let points = "";
                      let color = "text-zinc-400";

                      if (finished) {
                        const { points: scorePoints, exact } = calculateScore(
                          item.predicted_home_score,
                          item.predicted_away_score,
                          item.home_score ?? 0,
                          item.away_score ?? 0
                        );

                        if (exact) {
                          label = "✓ Exacto";
                          points = "+5 pts";
                          color = "text-[#f6d365]";
                        } else if (scorePoints === 3) {
                          label = "✓ Acierto";
                          points = "+3 pts";
                          color = "text-green-400";
                        } else {
                          label = "Sin acierto";
                          points = "+0 pts";
                          color = "text-red-400";
                        }
                      }

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/8 bg-black/25 p-4 backdrop-blur-md"
                        >
                          <p className="flex flex-wrap items-center gap-2 font-bold text-white">
                            <TeamLabel name={item.home_team} />
                            <span className="text-[#f6d365]">vs</span>
                            <TeamLabel name={item.away_team} />
                          </p>

                          <p className="mt-1 text-sm text-[#f6d365]">
                            Tu pronóstico: {item.predicted_home_score} :{" "}
                            {item.predicted_away_score}
                          </p>

                          {finished ? (
                            <>
                              <p className="mt-1 text-sm text-zinc-200">
                                Resultado: {item.home_score} : {item.away_score}
                              </p>

                              <p
                                className={`mt-2 text-xs font-black uppercase tracking-[0.14em] ${color}`}
                              >
                                {label}
                                {points && ` · ${points}`}
                              </p>
                            </>
                          ) : (
                            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
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
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}