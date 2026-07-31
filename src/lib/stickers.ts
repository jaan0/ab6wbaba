export interface Sticker {
  id: number;
  emoji: string;
  label: string;
}

export const STICKERS: Sticker[] = [
  { id: 1, emoji: "🎵", label: "Music note" },
  { id: 2, emoji: "🌙", label: "Moon" },
  { id: 3, emoji: "🌊", label: "Wave" },
  { id: 4, emoji: "❤️", label: "Heart" },
  { id: 5, emoji: "🎸", label: "Guitar" },
  { id: 6, emoji: "✨", label: "Sparkles" },
  { id: 7, emoji: "🌈", label: "Rainbow" },
  { id: 8, emoji: "🔥", label: "Fire" },
];

export function getStickerById(id: number | null): Sticker | null {
  if (id === null) return null;
  return STICKERS.find((s) => s.id === id) ?? null;
}
