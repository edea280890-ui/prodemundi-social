"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";

type Group = {
  id: string;
  name: string;
  code: string;
  owner_id: string | null;
  created_at: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [tablePage, setTablePage] = useState(1);

  function generateGroupCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const fetchGroups = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No se pudo identificar el usuario.");
      setLoading(false);
      return;
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (membershipsError) {
      setMessage(membershipsError.message);
      setLoading(false);
      return;
    }

    const memberGroupIds = memberships?.map((item) => item.group_id) ?? [];

    const { data: ownedGroups, error: ownedGroupsError } = await supabase
      .from("groups")
      .select("*")
      .eq("owner_id", user.id);

    if (ownedGroupsError) {
      setMessage(ownedGroupsError.message);
      setLoading(false);
      return;
    }

    let memberGroups: Group[] = [];

    if (memberGroupIds.length > 0) {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .in("id", memberGroupIds);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      memberGroups = data ?? [];
    }

    const allGroups = [...(ownedGroups ?? []), ...memberGroups];

    const uniqueGroups = Array.from(
      new Map(allGroups.map((group) => [group.id, group])).values()
    ).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setGroups(uniqueGroups);
    setLoading(false);
  }, []);

  async function createGroup() {
    setMessage("");

    const cleanName = groupName.trim();

    if (!cleanName) {
      setMessage("Escribí un nombre para el grupo.");
      return;
    }

    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No se pudo identificar el usuario.");
      setCreating(false);
      return;
    }

    const { data: existingGroup } = await supabase
      .from("groups")
      .select("id")
      .ilike("name", cleanName)
      .maybeSingle();

    if (existingGroup) {
      setMessage("Ese nombre de grupo ya está ocupado. Probá con otro.");
      setCreating(false);
      return;
    }

    const code = generateGroupCode();

    const { data: newGroup, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: cleanName,
        code,
        owner_id: user.id,
      })
      .select("*")
      .single();

    if (groupError) {
      setMessage(groupError.message);
      setCreating(false);
      return;
    }

    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: newGroup.id,
      user_id: user.id,
    });

    if (memberError) {
      setMessage(memberError.message);
      setCreating(false);
      return;
    }

    await supabase.from("group_scores").insert({
      group_id: newGroup.id,
      user_id: user.id,
      points: 0,
      exacts: 0,
    });

    setGroupName("");
    setMessage("Grupo creado correctamente.");
    setCreating(false);
    fetchGroups();
  }

  async function joinGroup() {
    setMessage("");

    const cleanCode = joinCode.trim().toUpperCase();

    if (!cleanCode) {
      setMessage("Ingresá un código de grupo.");
      return;
    }

    setJoining(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No se pudo identificar el usuario.");
      setJoining(false);
      return;
    }

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("code", cleanCode)
      .single();

    if (groupError || !group) {
      setMessage("No se encontró un grupo con ese código.");
      setJoining(false);
      return;
    }

    const { data: existingMember } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      setMessage("Ya sos miembro de este grupo.");
      setJoining(false);
      return;
    }

    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
    });

    if (memberError) {
      setMessage(memberError.message);
      setJoining(false);
      return;
    }

    await supabase.from("group_scores").insert({
      group_id: group.id,
      user_id: user.id,
      points: 0,
      exacts: 0,
    });

    setJoinCode("");
    setMessage("Te uniste al grupo correctamente.");
    setJoining(false);
    fetchGroups();
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchGroups]);


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
          <div className="mb-8 overflow-hidden rounded-[2rem] border border-[#d4af37]/15 bg-black/40 p-8 shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-[#d4af37]">
                  Torneos y Ligas
                </p>
                <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-[-0.03em] text-white drop-shadow-[0_0_24px_rgba(212,175,55,0.30)] sm:text-6xl">
                  Mis Grupos
                </h1>
              </div>

              <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111]/70 px-4 py-3 text-right">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f6d365]">
                  Competencia activa
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.18em] text-white">
                  Sentite en una liga de verdad
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-zinc-300">
              Creá tu torneo privado, compartí el código y competí por el podio en la tabla de posiciones.
            </p>
          </div>

          {message && (
            <p className="mb-5 rounded-2xl border border-[#d4af37]/20 bg-black/45 px-4 py-3 text-sm text-[#f6d365]">
              {message}
            </p>
          )}

          <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-[#d4af37]/15 bg-black/40 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-[#d4af37]/30">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d365]">
                ⚽ Nueva Competencia
              </p>

              <h2 className="mb-3 text-xl font-black uppercase tracking-[0.14em] text-white">
                Crear Torneo
              </h2>

              <p className="mb-5 text-sm leading-6 text-zinc-300">
                Armá tu torneo privado, compartí el código con los participantes y competí por el primer lugar.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Ej: Los Pibes del Mundial"
                  className="min-h-10 flex-1 rounded-2xl border border-[#d4af37]/20 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f6d365]"
                />

                <button
                  type="button"
                  onClick={createGroup}
                  disabled={creating}
                  className="min-h-10 rounded-2xl border border-[#d4af37]/40 bg-gradient-to-r from-[#d4af37]/30 to-[#d4af37]/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#f6d365] transition hover:border-[#f6d365]/70 hover:from-[#d4af37]/45 hover:to-[#d4af37]/20 hover:text-white hover:shadow-[0_0_24px_rgba(212,175,55,0.30)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Creando..." : "⚽ Crear"}
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#d4af37]/15 bg-black/40 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-[#d4af37]/30">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d365]">
                🎟️ Código de Invitación
              </p>

              <h2 className="mb-3 text-xl font-black uppercase tracking-[0.14em] text-white">
                Unirme a un Torneo
              </h2>

              <p className="mb-5 text-sm leading-6 text-zinc-300">
                Ingresá el código del torneo y empezá a competir en su tabla de posiciones.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="Código del grupo"
                  className="min-h-10 flex-1 rounded-2xl border border-[#d4af37]/20 bg-black/50 px-4 text-sm uppercase text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f6d365]"
                />

                <button
                  type="button"
                  onClick={joinGroup}
                  disabled={joining}
                  className="min-h-10 rounded-2xl border border-[#d4af37]/40 bg-gradient-to-r from-[#d4af37]/30 to-[#d4af37]/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#f6d365] transition hover:border-[#f6d365]/70 hover:from-[#d4af37]/45 hover:to-[#d4af37]/20 hover:text-white hover:shadow-[0_0_24px_rgba(212,175,55,0.30)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joining ? "Uniendo..." : "🎯 Unirme"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-black/40 to-black/25 p-6 backdrop-blur-lg">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d365]">
                  🏆 Mis Torneos Activos
                </p>
                <h2 className="text-lg font-black uppercase tracking-[0.14em]">
                  Posiciones Actuales
                </h2>
              </div>

              <span className="rounded-full border border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f6d365]">
                {groups.length} Torneo{groups.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <p className="rounded-2xl border border-white/5 bg-black/30 px-4 py-4 text-sm text-zinc-400">
                Cargando grupos...
              </p>
            ) : groups.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-black/30 px-5 py-6 text-center">
                <p className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-white">
                  Todavía no participás en ningún grupo
                </p>

                <p className="mx-auto max-w-md text-sm leading-6 text-zinc-400">
                  Creá tu primer grupo o ingresá un código de invitación para
                  empezar a competir con tus amigos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="group relative overflow-hidden rounded-[2rem] border border-[#d4af37]/15 bg-gradient-to-br from-black/45 via-[#111] to-black/40 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition hover:border-[#d4af37]/35 hover:shadow-[0_25px_90px_rgba(212,175,55,0.20)]"
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[2rem] bg-gradient-to-br from-[#d4af37]/10 to-transparent" />
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-[#f6d365] shadow-[0_0_25px_rgba(212,175,55,0.10)]">
                          <span className="text-[#f6d365]">🔑</span>
                          <span>{group.code}</span>
                        </div>

                        <h3 className="text-3xl font-black leading-tight text-white">
                          {group.name}
                        </h3>
                      </div>

                      <span className="shrink-0 rounded-3xl border border-[#d4af37]/20 bg-black/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f6d365] shadow-[0_8px_30px_rgba(0,0,0,0.20)]">
                        🎯 Torneo
                      </span>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3">
                      <div className="rounded-3xl border border-[#d4af37]/15 bg-black/30 px-4 py-4 text-center shadow-inner shadow-black/20">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b8a46a]">
                          📊 Tabla
                        </p>
                        <p className="mt-2 text-sm font-black text-[#f6d365]">
                          Posiciones
                        </p>
                      </div>

                      <div className="rounded-3xl border border-[#d4af37]/15 bg-black/30 px-4 py-4 text-center shadow-inner shadow-black/20">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b8a46a]">
                          🔒 Acceso
                        </p>
                        <p className="mt-2 text-sm font-black text-[#f6d365]">
                          Privado
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/grupos/${group.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/10 px-6 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#f6d365] transition hover:border-[#f6d365]/70 hover:from-[#d4af37]/45 hover:to-[#d4af37]/25 hover:text-white hover:shadow-[0_0_24px_rgba(212,175,55,0.25)]"
                    >
                      📋 Ver Torneo
                    </Link>
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