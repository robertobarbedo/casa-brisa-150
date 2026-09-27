import "server-only";
import type { Previsao } from "./tipos";

/**
 * Tempo e maré do Open-Meteo (gratuito, sem chave). Revalida a cada 30 min.
 * Se algum dos dois falhar, aquela parte vem null e a faixa "Agora" usa só
 * o que tiver (pôr do sol é calculado localmente e nunca falta).
 *
 * A maré é um modelo global, não a tábua da Marinha: os horários podem
 * variar alguns minutos em relação ao porto de Florianópolis.
 */

const REVALIDAR = 1800;

type Local = { latitude: number; longitude: number };

/** "2026-09-27T10:00" no fuso da resposta → ms */
const paraMs = (iso: string, offsetSeg: number) => Date.parse(`${iso}:00Z`) - offsetSeg * 1000;

async function buscar(url: string) {
  try {
    const resposta = await fetch(url, { next: { revalidate: REVALIDAR } });
    return resposta.ok ? await resposta.json() : null;
  } catch {
    return null;
  }
}

async function buscarTempo({ latitude, longitude }: Local): Promise<Previsao["tempo"]> {
  const j = await buscar(
    "https://api.open-meteo.com/v1/forecast?" +
      new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: "temperature_2m,weather_code,precipitation",
        hourly: "precipitation_probability,cloud_cover",
        daily: "weather_code,temperature_2m_max,uv_index_max",
        timezone: "America/Sao_Paulo",
        forecast_days: "3",
      }),
  );
  if (!j?.current || !j.hourly || !j.daily) return null;
  const off: number = j.utc_offset_seconds;

  return {
    atual: {
      temp: j.current.temperature_2m,
      codigo: j.current.weather_code,
      chuva: j.current.precipitation,
    },
    horas: (j.hourly.time as string[]).map((t, i) => ({
      t: paraMs(t, off),
      chuvaProb: j.hourly.precipitation_probability[i] ?? 0,
      nuvens: j.hourly.cloud_cover[i] ?? 0,
    })),
    dias: (j.daily.time as string[]).map((d, i) => ({
      t: paraMs(`${d}T00:00`, off),
      codigo: j.daily.weather_code[i],
      max: j.daily.temperature_2m_max[i],
      uvMax: j.daily.uv_index_max[i] ?? 0,
    })),
  };
}

async function buscarMare({ latitude, longitude }: Local): Promise<Previsao["mare"]> {
  const j = await buscar(
    "https://marine-api.open-meteo.com/v1/marine?" +
      new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        hourly: "sea_level_height_msl",
        timezone: "America/Sao_Paulo",
        past_days: "1",
        forecast_days: "3",
      }),
  );
  if (!j?.hourly) return null;
  const off: number = j.utc_offset_seconds;
  const serie = (j.hourly.time as string[])
    .map((t, i) => ({ t: paraMs(t, off), nivel: j.hourly.sea_level_height_msl[i] }))
    .filter((p) => typeof p.nivel === "number");
  return serie.length ? serie : null;
}

export async function buscarPrevisao(local: Local): Promise<Previsao> {
  const [tempo, mare] = await Promise.all([buscarTempo(local), buscarMare(local)]);
  return { tempo, mare };
}
