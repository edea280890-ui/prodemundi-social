"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";

type Stats = {
  groups: number;
  points: number;
  exacts: number;
  predictions: number;
  average: number;
  bestPosition: number | null;
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats>({
    groups: 0,
    points: 0,
    exacts: 0,
    predictions: 0,
    average: 0,
    bestPosition: null,
  });

  const [message, setMessage] = useState("");

  async function fetchStatistics() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No se pudo identificar el usuario.");
      return;
    }

    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    const groupIds = memberships?.map((item) => item.group_id) ?? [];

    const { data: scoreData } = await supabase
      .from("group_scores")
      .select("group_id, user_id, points, exacts")
      .eq("user_id", user.id);

    const totalPoints =
      scoreData?.reduce((sum, row) => sum + (row.points ?? 0), 0) ?? 0;

    const totalExacts =
      scoreData?.reduce((sum, row) => sum + (row.exacts ?? 0), 0) ?? 0;

    const { count: predictionCount } = await supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

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

    const predictions = predictionCount ?? 0;

    setStats({
      groups: groupIds.length,
      points: totalPoints,
      exacts: totalExacts,
      predictions,
      average: predictions > 0 ? totalPoints / predictions : 0,
      bestPosition,
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStatistics();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#d4af37]">
            Perfil competitivo
          </p>

          <h1 className="mb-3 font-[family-name:var(--font-cinzel)] text-3xl font-black leading-tight xl:text-4xl">
            Estadísticas
          </h1>

          <p className="mb-6 max-w-2xl text-sm leading-6 text-zinc-400">
            Revisá tu rendimiento general dentro de PRODEMUNDI: puntos, exactos,
            pronósticos y mejor posición alcanzada.
          </p>

          {message && (
            <p className="mb-5 rounded-2xl border border-[#d4af37]/20 bg-black/45 px-4 py-3 text-sm text-[#f6d365]">
              {message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Grupos
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats.groups}
              </p>
            </div>

            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                PTS
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats.points}
              </p>
            </div>

            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Exactos
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats.exacts}
              </p>
            </div>

            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Pronósticos
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats.predictions}
              </p>
            </div>

            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Promedio
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats.average.toFixed(1)}
              </p>
            </div>

            <div className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Mejor posición
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats.bestPosition ? `${stats.bestPosition}°` : "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#d4af37]/15 bg-black/35 p-5 backdrop-blur-2xl">
            <h2 className="mb-3 text-base font-black uppercase tracking-[0.14em]">
              Lectura rápida
            </h2>

            <p className="text-sm leading-6 text-zinc-400">
              Estas estadísticas resumen tu rendimiento general. Cada grupo
              mantiene su propia tabla de posiciones, pero acá podés ver tu
              desempeño acumulado dentro de PRODEMUNDI.
            </p>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}