import {
  READING_STORAGE_KEY,
  StoredReadingSchema,
  type StoredReading,
} from "@/lib/reading";
import { tarotCardMap } from "@/lib/tarot";

export function readStoredReading(storage: Storage): StoredReading | null {
  try {
    const raw = storage.getItem(READING_STORAGE_KEY);
    if (!raw) return null;

    const parsed = StoredReadingSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItem(READING_STORAGE_KEY);
      return null;
    }

    const uniqueCards = new Set(parsed.data.cards.map((card) => card.cardId));
    const cardsAreValid = parsed.data.cards.every((card) =>
      tarotCardMap.has(card.cardId),
    );

    if (!cardsAreValid || uniqueCards.size !== 3) {
      storage.removeItem(READING_STORAGE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    try {
      storage.removeItem(READING_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted browsers.
    }
    return null;
  }
}

export function writeStoredReading(
  storage: Storage,
  reading: StoredReading,
): boolean {
  try {
    storage.setItem(READING_STORAGE_KEY, JSON.stringify(reading));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredReading(storage: Storage): void {
  try {
    storage.removeItem(READING_STORAGE_KEY);
  } catch {
    // Resetting the in-memory experience still succeeds.
  }
}
