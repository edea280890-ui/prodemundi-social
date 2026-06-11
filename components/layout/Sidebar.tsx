"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  username: string;
  display_name: string;
  avatar_id: string;
};

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Mi Perfil", href: "/dashboard/perfil" },
  { label: "Mis Grupos", href: "/dashboard/grupos" },
  { label: "Partidos", href: "/dashboard/partidos" },
  { label: "Ayuda", href: "/dashboard/ayuda" },
  { label: "Administración", href: "/dashboard/admin" },
];

export default function Sidebar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const fetchProfile = useCallback(async () => {
    await Promise.resolve();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_id")
      .eq("id", user.id)
      .single();

    if (data) setProfile(data);
  }, []);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  return (
    <>
      <div className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#d4af37]/10 bg-black/20 px-4 backdrop-blur-lg xl:hidden">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PRODEMUNDI Social"
            width={40}
            height={40}
            className="h-9 w-auto object-contain"
          />

          <div>
            <h1 className="font-[family-name:var(--font-exo2)] text-sm font-extrabold tracking-[0.12em] text-white">
              PRODE<span className="text-[#d4af37]">MUNDI</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#b8a46a]">
              Social
            </p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-black/30 text-[#f6d365] backdrop-blur-md"
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm xl:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col overflow-y-auto border-r border-[#d4af37]/15 bg-gradient-to-b from-black/15 via-black/20 to-black/25 backdrop-blur-lg transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        }`}
      >
        <div className="relative flex items-center gap-3 border-b border-[#d4af37]/15 px-6 py-5">
          <Image
            src="/logo.png"
            alt="PRODEMUNDI Social"
            width={56}
            height={56}
            className="h-11 w-auto object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.32)]"
          />

          <div>
            <h1 className="font-[family-name:var(--font-exo2)] text-base font-extrabold tracking-[0.14em] text-white">
              PRODE<span className="text-[#d4af37]">MUNDI</span>
            </h1>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#b8a46a]">
              Social
            </p>
          </div>
        </div>

        <nav className="relative flex-1 px-5 py-6">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`group relative flex min-h-12 items-center overflow-hidden rounded-2xl border px-5 text-left transition-all duration-300 ${
                    active
                      ? "border-[#d4af37]/35 bg-black/40 text-[#ffd978] shadow-[0_0_22px_rgba(212,175,55,0.12)] backdrop-blur-md"
                      : "border-transparent bg-transparent text-zinc-400 hover:border-[#d4af37]/20 hover:bg-black/25 hover:text-white hover:backdrop-blur-md"
                  }`}
                >
                  <span className="text-sm font-bold uppercase tracking-[0.14em]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="relative border-t border-[#d4af37]/15 px-6 py-5">
          <div className="rounded-2xl border border-[#d4af37]/15 bg-black/25 p-4 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-visible">
                <Image
                  src={`/avatars/${profile?.avatar_id || "avatar_01"}.png`}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="h-14 w-auto object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {profile?.display_name || "Usuario"}
                </p>
                <p className="truncate text-xs text-[#ffd978]">
                  @{profile?.username || "usuario"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-2xl border border-[#d4af37]/30 bg-black/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#f6d365] backdrop-blur-md transition hover:border-[#f6d365]/60 hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}