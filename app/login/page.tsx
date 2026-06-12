"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setMessage("");

    if (!email || !password) {
      setMessage("Completá todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage("Error de conexión: " + errorMsg);
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
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
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#d4af37]/18 bg-black/25 shadow-[0_25px_80px_rgba(0,0,0,0.34)] backdrop-blur-md lg:grid-cols-[1fr_0.9fr]">
          <div className="relative hidden min-h-[580px] overflow-visible p-10 lg:block">
            <Image
              src="/logo.png"
              alt="PRODEMUNDI Social"
              width={320}
              height={320}
              priority
              className="relative z-10 mx-auto h-56 w-auto object-contain"
            />

            <div className="relative z-10 mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.30em] text-[#f6d365]">
                Ingresá a tu torneo
              </p>

              <h1 className="font-[family-name:var(--font-cinzel)] text-5xl font-black leading-none">
                Volvé a jugar
                <span className="block text-[#ffd978]">con tu grupo</span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-zinc-100">
                Entrá a tus grupos, cargá pronósticos y revisá cómo venís en la
                tabla de posiciones.
              </p>
            </div>

            <Image
              src="/jugador7.png"
              alt="Jugador decorativo"
              width={300}
              height={300}
              className="absolute bottom-[-28px] right-[-8px] h-auto w-[280px] object-contain"
            />
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

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#f6d365]">
              Iniciar sesión
            </p>

            <h2 className="font-[family-name:var(--font-cinzel)] text-4xl font-black leading-none">
              Bienvenido
              <span className="block text-[#ffd978]">de nuevo</span>
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#f6d365]">
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
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#f6d365]">
                  Contraseña
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#d4af37]/18 bg-black/35 px-5 py-4 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-zinc-500 focus:border-[#d4af37]/55"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border border-[#d4af37]/40 bg-black/40 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#f6d365]/70 hover:text-[#f6d365] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Ingresando..." : "Entrar"}
              </button>

              {message && (
                <p className="rounded-2xl border border-[#d4af37]/20 bg-black/35 px-4 py-3 text-center text-sm text-[#ffd978] backdrop-blur-md">
                  {message}
                </p>
              )}
            </form>

            <p className="mt-8 text-center text-sm text-zinc-100">
              ¿No tenés cuenta?{" "}
              <Link
                href="/register"
                className="font-bold text-[#ffd978] transition hover:text-white"
              >
                Crear cuenta
              </Link>
            </p>

            <p className="mt-4 text-center text-sm text-zinc-100">
              ¿Te olvidaste la contraseña?{" "}
              <Link
                href="/forgot-password"
                className="font-bold text-[#ffd978] transition hover:text-white"
              >
                Recuperar clave
              </Link>
            </p>

            <p className="mt-4 text-center">
              <Link
                href="/"
                className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300 transition hover:text-[#f6d365]"
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