import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";
import { AI_CONFIG } from "@/lib/ai/config";
import { buildReadingPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import {
  ReadingResultSchema,
  spreadPositions,
  type ReadingRequest,
  type ReadingResult,
} from "@/lib/reading";
import { getTarotCard } from "@/lib/tarot";

export class AIConfigurationError extends Error {}
export class AIResponseValidationError extends Error {}

function validateImmutableFields(
  request: ReadingRequest,
  result: ReadingResult,
): ReadingResult {
  result.cards.forEach((outputCard, index) => {
    const drawnCard = request.cards[index];
    const trustedCard = getTarotCard(drawnCard.cardId);
    const position = spreadPositions[index];

    if (
      !trustedCard ||
      outputCard.cardId !== drawnCard.cardId ||
      outputCard.cardName !== trustedCard.nameZh ||
      outputCard.orientation !== drawnCard.orientation ||
      outputCard.position !== position.id
    ) {
      throw new AIResponseValidationError(
        `第 ${index + 1} 張牌的識別資料與抽牌結果不一致`,
      );
    }
  });

  return result;
}

async function requestStructuredReading(
  client: OpenAI,
  request: ReadingRequest,
  repairReason?: string,
): Promise<ReadingResult> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AI_CONFIG.requestTimeoutMs,
  );

  try {
    const response = await client.responses.parse(
      {
        model: AI_CONFIG.model,
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildReadingPrompt(request, repairReason) },
        ],
        text: {
          format: zodTextFormat(ReadingResultSchema, "tarot_reading"),
        },
        reasoning: { effort: "low" },
        max_output_tokens: AI_CONFIG.maxOutputTokens,
      },
      { signal: controller.signal },
    );

    if (!response.output_parsed) {
      throw new AIResponseValidationError("模型未回傳可驗證的結構化內容");
    }

    return validateImmutableFields(
      request,
      ReadingResultSchema.parse(response.output_parsed),
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateReading(
  request: ReadingRequest,
): Promise<ReadingResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AIConfigurationError("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey, timeout: AI_CONFIG.requestTimeoutMs });

  try {
    return await requestStructuredReading(client, request);
  } catch (error) {
    if (!(error instanceof AIResponseValidationError || error instanceof ZodError)) {
      throw error;
    }

    return requestStructuredReading(client, request, error.message);
  }
}
