const names = new Intl.DisplayNames(["es"], { type: "region" });

export function countryName(code: string) {
  if (code === "XX") return "Desconocido";
  try {
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

export function flag(code: string) {
  if (!/^[A-Z]{2}$/.test(code) || code === "XX") return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
