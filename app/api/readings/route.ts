import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AIConfigurationError, generateReading } from "@/lib/ai/service";
import { ReadingRequestSchema } from "@/lib/reading";
import { beginRequest, checkRateLimit, endRequest } from "@/lib/rate-limit";
import { tarotCardMap } from "@/lib/tarot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_CARDS"
  | "DUPLICATE_REQUEST"
  | "RATE_LIMITED"
  | "AI_NOT_CONFIGURED"
  | "AI_UNAVAILABLE";

function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json({ error: { code, message } }, { status, headers });
}

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request);
  const limit = checkRateLimit(clientId);

  if (!limit.allowed) {
    return errorResponse(
      "RATE_LIMITED",
      "請稍候片刻再重新解讀。",
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "請求格式不正確。", 400);
  }

  const parsed = ReadingRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("INVALID_REQUEST", "問題或抽牌資料格式不正確。", 400);
  }

  if (!parsed.data.cards.every((card) => tarotCardMap.has(card.cardId))) {
    return errorResponse("INVALID_CARDS", "抽牌資料無法驗證。", 400);
  }

  const activeKey = `${clientId}:${parsed.data.readingId}`;
  if (!beginRequest(activeKey)) {
    return errorResponse(
      "DUPLICATE_REQUEST",
      "這次解讀正在進行中，請不要重複送出。",
      409,
    );
  }

  try {
    const result = await generateReading(parsed.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof AIConfigurationError) {
      return errorResponse(
        "AI_NOT_CONFIGURED",
        "AI 解讀服務尚未完成設定。",
        503,
      );
    }

    if (error instanceof OpenAI.APIError && error.status === 429) {
      return errorResponse(
        "RATE_LIMITED",
        "AI 服務目前較忙碌，請稍候再試。",
        429,
      );
    }

    return errorResponse(
      "AI_UNAVAILABLE",
      "這次解讀暫時沒有完成，請使用原本的三張牌重新解讀。",
      502,
    );
  } finally {
    endRequest(activeKey);
  }
}
