"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type HelpItem = {
  question: string;
  answer: string;
};

type HelpSection = {
  title: string;
  items: HelpItem[];
};

const sections: HelpSection[] = [
  {
    title: "Cómo funciona PRODEMUNDI",
    items: [
      {
        question: "¿Qué es PRODEMUNDI?",
        answer:
          "PRODEMUNDI es una competencia de pronósticos deportivos pensada para divertirse con amigos, familiares, compañeros de trabajo y comunidades. Cada participante pronostica resultados, suma puntos y compite dentro de sus grupos.",
      },
      {
        question: "¿Cómo creo una cuenta?",
        answer:
          "Registrate, elegí un nombre visible, un nombre de usuario y un avatar. Ese perfil se usará en todos los grupos donde participes.",
      },
      {
        question: "¿Cómo creo un grupo?",
        answer:
          "Ingresá a Grupos, seleccioná Crear grupo, elegí un nombre y compartí el código de invitación con las personas que quieras sumar.",
      },
      {
        question: "¿Cómo me uno a un grupo?",
        answer:
          "Solicitá el código de invitación, ingresá a Grupos, seleccioná Unirme e ingresá el código.",
      },
      {
        question: "¿Puedo participar en varios grupos?",
        answer:
          "Sí. Podés participar en todos los grupos que quieras al mismo tiempo.",
      },
      {
        question: "¿Puedo abandonar un grupo?",
        answer:
          "Sí. Podés salir cuando quieras. Si volvés a ingresar, comenzarás nuevamente desde cero en ese grupo.",
      },
      {
        question: "¿Qué pasa con mi historial si salgo de un grupo?",
        answer:
          "Al salir de un grupo se eliminan tus puntos, pronósticos e historial dentro de ese grupo. Si volvés a entrar, empezás desde cero.",
      },
      {
        question: "¿Qué ocurre si el administrador abandona el grupo?",
        answer:
          "La administración pasará al integrante más antiguo para que el grupo pueda seguir funcionando.",
      },
      {
        question: "¿Puedo eliminar un grupo?",
        answer:
          "Sí. El creador del grupo puede eliminarlo. Al hacerlo, el grupo y su información dejarán de estar disponibles.",
      },
    ],
  },
  {
    title: "Reglas y puntuación",
    items: [
      {
        question: "¿Cómo hago un pronóstico?",
        answer:
          "Indicá los goles que creés que marcará cada equipo. Por ejemplo: Argentina 2 - 1 Brasil.",
      },
      {
        question: "¿Cuándo cierran los pronósticos?",
        answer:
          "Los pronósticos cierran 30 minutos antes del inicio del partido.",
      },
      {
        question: "¿Qué es un exacto?",
        answer:
          "Es cuando acertás el resultado completo del partido. Por ejemplo, pronosticás 2-1 y el partido termina 2-1. Suma 5 puntos.",
      },
      {
        question: "¿Qué es un acierto?",
        answer:
          "Es cuando acertás el ganador o el empate, pero no el marcador exacto. Suma 3 puntos.",
      },
      {
        question: "¿Cuánto suma cada resultado?",
        answer:
          "Exacto: 5 puntos. Acierto: 3 puntos. Sin acierto: 0 puntos.",
      },
      {
        question: "¿Cómo funciona la tabla de posiciones?",
        answer:
          "Cada grupo tiene su propia tabla. Los participantes se ordenan por puntos y luego por cantidad de exactos.",
      },
      {
        question: "¿Cómo se desempata?",
        answer:
          "Primero se compara la cantidad de puntos. Si hay igualdad, se compara la cantidad de exactos. Si sigue igual, la posición queda compartida.",
      },
      {
        question: "¿Cómo funcionan los playoffs?",
        answer:
          "En playoffs se pueden pronosticar 90 minutos, suplementario y penales. En 90 minutos y suplementario, exacto suma 5 y acierto suma 3. En penales, acertar el ganador suma 5.",
      },
    ],
  },
  {
    title: "Distinciones",
    items: [
      {
        question: "¿Qué son las distinciones?",
        answer:
          "Son reconocimientos simbólicos que se otorgan al finalizar la competencia. No son premios económicos: buscan sumar diversión y destacar desempeños dentro del grupo.",
      },
      {
        question: "Campeón",
        answer:
          "Se otorga al participante que finaliza primero en la tabla de posiciones.",
      },
      {
        question: "Subcampeón",
        answer:
          "Se otorga al participante que finaliza segundo en la tabla de posiciones.",
      },
      {
        question: "Tercer puesto",
        answer:
          "Se otorga al participante que finaliza tercero en la tabla de posiciones.",
      },
      {
        question: "Especialista",
        answer:
          "Se otorga al participante con mayor cantidad de resultados exactos.",
      },
      {
        question: "Carambola",
        answer:
          "Se otorga al participante con mayor cantidad de aciertos.",
      },
      {
        question: "Burro",
        answer:
          "Se otorga al participante que finaliza último. Es una distinción humorística pensada para divertirse dentro del grupo.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<string | null>(
    "Cómo funciona PRODEMUNDI"
  );

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

        <section className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-24 sm:px-6 xl:pl-[320px] xl:pt-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.30em] text-[#f6d365]">
            Centro de ayuda
          </p>

          <h1 className="mb-3 font-[family-name:var(--font-cinzel)] text-3xl font-black leading-tight xl:text-4xl">
            Ayuda
          </h1>

          <p className="mb-6 max-w-2xl text-sm leading-6 text-zinc-200">
            Reglas simples para jugar, sumar puntos y entender cómo funciona la
            competencia.
          </p>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#d4af37]/18 bg-black/25 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                Grupos
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                Crear, invitar y competir
              </p>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/18 bg-black/25 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                Puntuación
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                Exactos, aciertos y tabla
              </p>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/18 bg-black/25 p-4 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                Distinciones
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                Reconocimientos finales
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section) => {
              const isOpen = openSection === section.title;

              return (
                <div
                  key={section.title}
                  className="rounded-3xl border border-[#d4af37]/18 bg-black/25 p-4 backdrop-blur-md"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSection(isOpen ? null : section.title)
                    }
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-base font-black uppercase tracking-[0.14em] text-white">
                      {section.title}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-black/25 text-[#f6d365]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                      {section.items.map((item) => (
                        <div
                          key={item.question}
                          className="rounded-2xl border border-white/8 bg-black/25 p-4 backdrop-blur-md"
                        >
                          <h2 className="text-sm font-black text-[#f6d365]">
                            {item.question}
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-zinc-200">
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}