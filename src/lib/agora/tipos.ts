/**
 * Tipos da central de mensagens ("Agora") do /bem-vindos.
 *
 * O fluxo tem três peças independentes:
 *   1. Previsao  — dados brutos (tempo + maré), buscados no servidor.
 *   2. Contexto  — o "momento" já interpretado: período do dia, pôr do sol,
 *                  próxima maré, se está chovendo... (contexto.ts)
 *   3. Regras    — cada mensagem é uma regra declarativa: quando vale,
 *                  qual a prioridade, quais valores ela mostra e para onde leva.
 *                  (catalogo.ts)
 *
 * O TEXTO de cada mensagem não mora aqui: fica nos dicionários
 * (agora.mensagens.<id>), como uma lista de variações. Assim dá para
 * reescrever, traduzir ou gerar novas variações (inclusive com IA, no futuro)
 * sem mexer na lógica.
 */
import type { CategoriaId } from "@/lib/bem-vindos/categorias";

/** Dados de tempo e maré, serializáveis (vão do servidor para o cliente). */
export type Previsao = {
  tempo: {
    atual: { temp: number; codigo: number; chuva: number; vento: number; ventoDirecao: number };
    horas: { t: number; temp: number; codigo: number; chuvaProb: number; nuvens: number; uv: number }[];
    dias: { t: number; codigo: number; max: number; min: number; chuvaProb: number; uvMax: number }[];
  } | null;
  /** Nível do mar hora a hora (m), para achar marés altas e baixas. */
  mare: { t: number; nivel: number }[] | null;
};

export type Ceu = "sol" | "nublado" | "chuva";

export type EventoMare = { tipo: "alta" | "baixa"; t: number; nivel: number };

export type Periodo = "manha" | "tarde" | "porDoSol" | "anoitecer" | "noite";

/** O momento presente, já interpretado. Tempos em ms (epoch). */
export type Contexto = {
  agora: number;
  /** Minutos desde a meia-noite, no horário da casa. */
  minutoDoDia: number;
  /** Dia do ano, usado para variar o texto de um dia para o outro. */
  diaDoAno: number;
  periodo: Periodo;
  /** Fim de semana ou alta temporada (dez–fev): praia mais cheia. Feriados não entram. */
  diaDeMovimento: boolean;
  nascer: number;
  porDoSol: number;
  /** Negativo depois que o sol já se pôs. */
  minAtePorDoSol: number;
  mares: EventoMare[];
  proximaMare: EventoMare | null;
  tempo: {
    temp: number;
    ceu: Ceu;
    chovendo: boolean;
    uvMax: number;
    /** Índice UV da hora atual (0 à noite). */
    uvAgora: number;
    /** Nuvens (%) na hora do pôr do sol. */
    nuvensPorDoSol: number | null;
    /** Primeira hora com chuva provável nas próximas 6 h. */
    chuvaEm: number | null;
    amanha: { ceu: Ceu; max: number } | null;
  } | null;
};

/** Para onde a mensagem leva ao ser tocada. */
export type Destino = CategoriaId | "whatsapp";

/**
 * Valores que entram no texto: {hora}, {min}, {temp}...
 * { hora: t } e { ceu } são formatados/traduzidos no idioma do hóspede.
 */
export type Valor = string | number | { hora: number } | { ceu: Ceu };
export type Valores = Record<string, Valor>;

export type Regra = {
  /** Chave do texto em agora.mensagens.<id> nos dicionários. */
  id: string;
  /** Maior aparece primeiro. */
  prioridade: number;
  quando: (ctx: Contexto) => boolean;
  valores?: (ctx: Contexto) => Valores;
  destino?: Destino;
};

/** Mensagem pronta para exibir. */
export type Mensagem = { id: string; texto: string; destino?: Destino };
