"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister() {
    setMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Completá todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (!data.user) {
      setLoading(false);
      setMessage("No se pudo crear el usuario.");
      return;
    }

    setLoading(false);
    setMessage("Cuenta creada. Revisá tu email para confirmar el registro.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] font-[family-name:var(--font-montserrat)] text-white">
      <div className="absolute inset-0">
        <Image
          src="/fondo-prodemundi.png"
          alt="Fondo PRODEMUNDI"
          fill
          priority
          className="object-cover object-center opacity-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/55" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-10">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#d4af37]/18 bg-black/25 shadow-[0_25px_80px_rgba(0,0,0,0.34)] backdrop-blur-md lg:grid-cols-[0.95fr_1fr]">
          <div className="relative hidden min-h-[620px] overflow-visible p-10 lg:block">
            <Image
              src="/jugador9.png"
              alt="Jugador decorativo"
              width={250}
              height={250}
              className="absolute bottom-[-18px] left-[-8px] h-auto w-[300px] object-contain"
            />

            <div className="relative z-10 ml-auto max-w-md">
              <Image
                src="/logo.png"
                alt="PRODEMUNDI Social"
                width={220}
                height={220}
                priority
                className="ml-auto h-40 w-auto object-contain"
              />

              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.30em] text-[#f6d365]">
                Nueva cuenta
              </p>

              <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-5xl font-black leading-none">
                Armá tu
                <span className="block text-[#ffd978]">prode mundial</span>
              </h1>

              <p className="mt-5 text-sm leading-7 text-zinc-100">
                Creá tu perfil, elegí tu identidad y empezá a competir en
                grupos privados con amigos, familia o compañeros.
              </p>
            </div>
          </div>

          <div className="bg-black/20 p-7 sm:p-10 lg:p-12">
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <Image
                src="/logo.png"
                alt="PRODEMUNDI Social"
                width={180}
                height={180}
                priority
                className="h-32 w-auto object-contain"
              />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.30em] text-[#f6d365]">
              Registro
            </p>

            <h2 className="font-[family-name:var(--font-cinzel)] text-4xl font-black leading-none">
              Crear
              <span className="block text-[#ffd978]">cuenta</span>
            </h2>

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#f6d365]">
                  Nombre visible
                </label>

                <input
                  type="text"
                  placeholder="Ej: Emiliano"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-[#d4af37]/18 bg-black/35 px-5 py-4 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-zinc-500 focus:border-[#d4af37]/55"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#f6d365]">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#d4af37]/18 bg-black/35 px-5 py-4 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-zinc-500 focus:border-[#d4af37]/55"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#f6d365]">
                  Contraseña
                </label>

                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#d4af37]/18 bg-black/35 px-5 py-4 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-zinc-500 focus:border-[#d4af37]/55"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#f6d365]">
                  Confirmar contraseña
                </label>

                <input
                  type="password"
                  placeholder="Repetí tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#d4af37]/18 bg-black/35 px-5 py-4 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-zinc-500 focus:border-[#d4af37]/55"
                />
              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full rounded-2xl border border-[#d4af37]/40 bg-black/40 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#f6d365]/70 hover:text-[#f6d365] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              {message && (
                <p className="rounded-2xl border border-[#d4af37]/20 bg-black/35 px-4 py-3 text-sm text-[#ffd978] backdrop-blur-md">
                  {message}
                </p>
              )}
            </form>

            <p className="mt-8 text-center text-sm text-zinc-100">
              ¿Ya tenés cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#ffd978] transition hover:text-white"
              >
                Iniciar sesión
              </Link>
            </p>

            <p className="mt-4 text-center">
              <Link
                href="/"
                className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 transition hover:text-[#f6d365]"
              >
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}