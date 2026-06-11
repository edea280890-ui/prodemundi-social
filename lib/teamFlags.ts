const TEAM_FLAGS: Record<string, string> = {
  "Canadá": "ca",
  "EE. UU.": "us",
  "México": "mx",
  "Alemania": "de",
  "Arabia Saudí": "sa",
  "Argelia": "dz",
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Bélgica": "be",
  "Bosnia y Herzegovina": "ba",
  "Brasil": "br",
  "Catar": "qa",
  "Chequia": "cz",
  "Colombia": "co",
  "Costa de Marfil": "ci",
  "Croacia": "hr",
  "Curazao": "cw",
  "Ecuador": "ec",
  "Egipto": "eg",
  "Escocia": "gb-sct",
  "España": "es",
  "Francia": "fr",
  "Ghana": "gh",
  "Haití": "ht",
  "Inglaterra": "gb-eng",
  "Irak": "iq",
  "Islas de Cabo Verde": "cv",
  "Japón": "jp",
  "Jordania": "jo",
  "Marruecos": "ma",
  "Noruega": "no",
  "Nueva Zelanda": "nz",
  "Países Bajos": "nl",
  "Panamá": "pa",
  "Paraguay": "py",
  "Portugal": "pt",
  "República Democrática del Congo": "cd",
  "República de Corea": "kr",
  "RI de Irán": "ir",
  "Senegal": "sn",
  "Sudáfrica": "za",
  "Suecia": "se",
  "Suiza": "ch",
  "Túnez": "tn",
  "Turquía": "tr",
  "Uruguay": "uy",
  "Uzbekistán": "uz",
};

const ALIASES: Record<string, string> = {
  "Estados Unidos": "EE. UU.",
  "EEUU": "EE. UU.",
  "EE.UU": "EE. UU.",
  "Corea del Sur": "República de Corea",
  "Irán": "RI de Irán",
  "Holanda": "Países Bajos",
  "Arabia Saudita": "Arabia Saudí",
};

export function getTeamFlagCode(teamName: string): string {
  const normalized = teamName.trim();
  const finalName = ALIASES[normalized] ?? normalized;
  return TEAM_FLAGS[finalName] ?? "";
}

export function getTeamFlag(teamName: string) {
  // Deprecated: kept for backward compatibility
  return getTeamFlagCode(teamName);
}

export function getTeamLabel(teamName: string) {
  // Deprecated: kept for backward compatibility
  const code = getTeamFlagCode(teamName);
  return code ? `${code} ${teamName}` : teamName;
}