import { describe, expect, it } from "vitest";
import { PROMPT_VERSION } from "@/lib/version";
import { READING_STORAGE_KEY, READING_VERSION, type StoredReading } from "@/lib/reading";
import { readStoredReading, writeStoredReading } from "@/lib/storage";
import { tarotCards } from "@/lib/tarot";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function createReading(): StoredReading {
  return {
    version: READING_VERSION,
    readingId: crypto.randomUUID(),
    question: "接下來可以怎麼思考？",
    category: "general",
    cards: tarotCards.slice(0, 3).map((card) => ({
      cardId: card.id,
      orientation: "upright" as const,
    })),
    createdAt: new Date().toISOString(),
    promptVersion: PROMPT_VERSION,
    result: null,
  };
}

describe("reading storage", () => {
  it("round-trips a valid fixed reading", () => {
    const storage = new MemoryStorage();
    const reading = createReading();
    expect(writeStoredReading(storage, reading)).toBe(true);
    expect(readStoredReading(storage)).toEqual(reading);
  });

  it("ignores and removes invalid browser data", () => {
    const storage = new MemoryStorage();
    storage.setItem(READING_STORAGE_KEY, "not-json");
    expect(readStoredReading(storage)).toBeNull();
    expect(storage.getItem(READING_STORAGE_KEY)).toBeNull();
  });
});
