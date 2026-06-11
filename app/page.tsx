"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const cards = [
  {
    title: "CREÁ TU GRUPO",
    text: "Armá una competencia privada para jugar con amigos, familia o compañeros de trabajo.",
    image: "/jugador9.png",
    alt: "Crear grupo",
  },
  {
    title: "PRONOSTICÁ",
    text: "Cargá tus resultados antes de cada partido y seguí tu rendimiento en la tabla.",
    image: "/jugador33.png",
    alt: "Pronosticar",
  },
  {
    title: "COMPETÍ",
    text: "Sumá puntos, buscá exactos y peleá el primer puesto hasta el final.",
    image: "/jugador11.png",
    alt: "Competir",
  },
];

const imageAdjustments: Record<string, string> = {
  "/jugador9.png": "scale-[1.12]",
  "/jugador33.png": "scale-[1.02]",
  "/jugador11.png": "scale-[1.25]",
};

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-5 pt-4 sm:px-8 lg:px-10">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-500 ${
          scrolled
            ? "border-[#d4af37]/25 bg-black/45 shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl"
            : "border-[#d4af37]/15 bg-black/25 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md"
        }`}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PRODEMUNDI Social"
            width={58}
            height={58}
            priority
            className="h-11 w-auto object-contain"
          />

          <div className="leading-none">
            <p className="font-[family-name:var(--font-cinzel)] text-sm font-black tracking-[0.16em] text-white">
              PRODE<span className="text-[#d4af37]">MUNDI</span>
            </p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6d365]">
              Social
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:border-[#d4af37]/40 hover:text-[#f6d365] sm:block"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-[#d4af37]/45 bg-black/35 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:border-[#f6d365]/70 hover:text-[#f6d365]"
          >
            Crear cuenta
          </Link>
        </div>
      </nav>
    </header>
  );
}

function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex h-[160px] w-[160px] items-center justify-center overflow-visible">
      <Image
        src={src}
        alt={alt}
        width={420}
        height={420}
        className={`h-[160px] w-[160px] object-contain ${
          imageAdjustments[src] ?? ""
        } drop-shadow-[0_0_34px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-110`}
      />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <Navbar />

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

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-5 pb-10 pt-28 text-center sm:px-8 lg:px-10">
        <div className="mt-6">
          <Image
            src="/logo.png"
            alt="PRODEMUNDI Social"
            width={360}
            height={360}
            priority
            className="h-44 w-auto object-contain sm:h-56 lg:h-64"
          />
        </div>

        <div className="-mt-1 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f6d365]">
            Competencia de pronósticos deportivos
          </p>

          <h1 className="mt-4 font-[family-name:var(--font-cinzel)] text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Jugá el Mundial con tu grupo
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-100 sm:text-base">
            Creá un grupo privado, invitá amigos, pronosticá resultados y
            competí para demostrar quién sabe más de fútbol.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-xl border border-[#d4af37]/40 bg-black/40 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#f6d365]/70 hover:text-[#f6d365] sm:w-auto sm:text-sm"
            >
              Crear cuenta
            </Link>

            <Link
              href="/login"
              className="w-full rounded-xl border border-white/15 bg-black/25 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#d4af37]/45 sm:w-auto sm:text-sm"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-3 lg:mt-14">
          {cards.map((card) => (
            <article
              key={card.title}
              className="group relative overflow-visible rounded-2xl border border-[#d4af37]/18 bg-black/25 px-5 pb-5 pt-20 text-center shadow-[0_18px_46px_rgba(0,0,0,0.26)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/38"
            >
              <div className="absolute -right-5 -top-14 z-20 flex h-[150px] w-[150px] items-center justify-center overflow-visible">
                <CardImage src={card.image} alt={card.alt} />
              </div>

              <h2 className="text-base font-black uppercase tracking-[0.10em] text-white">
                {card.title}
              </h2>

              <div className="mx-auto mt-3 h-px w-12 bg-[#d4af37]" />

              <p className="mx-auto mt-2 max-w-[260px] text-center text-[13px] leading-5 text-zinc-200">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}