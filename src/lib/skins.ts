export interface Skin {
  id: number;
  name: string;
  /** Tailwind class for the page background */
  bg: string;
  /** Tailwind class for the primary text */
  text: string;
  /** Tailwind class for the accent / highlight colour */
  accent: string;
  /** Tailwind class for the accent text (used on accent backgrounds) */
  accentText: string;
  /** Tailwind class for a subtle card/glass background */
  card: string;
  /** Tailwind class for card border */
  border: string;
  /** CSS gradient string for decorative elements */
  gradient: string;
  /** Emoji or character used as the tape icon */
  icon: string;
}

export const SKINS: Record<number, Skin> = {
  1: {
    id: 1,
    name: "Neon Noir",
    bg: "bg-gray-950",
    text: "text-fuchsia-200",
    accent: "bg-fuchsia-500",
    accentText: "text-white",
    card: "bg-gray-900/80 backdrop-blur-sm",
    border: "border-fuchsia-900",
    gradient: "linear-gradient(135deg, #701a75 0%, #0ea5e9 100%)",
    icon: "📼",
  },
  2: {
    id: 2,
    name: "Lo-Fi Dusk",
    bg: "bg-amber-950",
    text: "text-amber-100",
    accent: "bg-orange-500",
    accentText: "text-white",
    card: "bg-amber-900/70 backdrop-blur-sm",
    border: "border-orange-900",
    gradient: "linear-gradient(135deg, #92400e 0%, #f97316 100%)",
    icon: "🌇",
  },
  3: {
    id: 3,
    name: "Arctic Tape",
    bg: "bg-slate-900",
    text: "text-cyan-100",
    accent: "bg-cyan-500",
    accentText: "text-slate-900",
    card: "bg-slate-800/80 backdrop-blur-sm",
    border: "border-cyan-900",
    gradient: "linear-gradient(135deg, #164e63 0%, #a5f3fc 100%)",
    icon: "❄️",
  },
  4: {
    id: 4,
    name: "Vinyl Sunset",
    bg: "bg-purple-950",
    text: "text-yellow-100",
    accent: "bg-yellow-400",
    accentText: "text-purple-950",
    card: "bg-purple-900/70 backdrop-blur-sm",
    border: "border-purple-700",
    gradient: "linear-gradient(135deg, #4c1d95 0%, #fbbf24 100%)",
    icon: "🌅",
  },
};

export const SKIN_IDS = [1, 2, 3, 4] as const;
