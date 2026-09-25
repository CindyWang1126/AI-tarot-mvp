import "server-only";
import { PROMPT_VERSION } from "@/lib/version";

export const AI_CONFIG = {
  model: process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
  requestTimeoutMs: 45_000,
  maxOutputTokens: 2_500,
  promptVersion: PROMPT_VERSION,
} as const;
