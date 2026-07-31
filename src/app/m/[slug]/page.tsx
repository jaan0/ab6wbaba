import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { mixtapes, tracks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { SKINS } from "@/lib/skins";
import { getStickerById } from "@/lib/stickers";
import Player from "./_components/Player";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Mixtape — ${slug} | musictape`,
    description: "Someone made you a mixtape 🎵",
  };
}

export default async function MixtapePage({ params }: Props) {
  const { slug } = await params;

  const db = getDb();

  // Fetch mixtape
  const [mixtape] = await db
    .select()
    .from(mixtapes)
    .where(eq(mixtapes.slug, slug))
    .limit(1);

  if (!mixtape) notFound();

  // Fetch tracks in order
  const trackList = await db
    .select()
    .from(tracks)
    .where(eq(tracks.mixtapeId, mixtape.id))
    .orderBy(asc(tracks.trackOrder));

  const skin = SKINS[mixtape.skinId] ?? SKINS[1];
  const sticker = getStickerById(mixtape.stickerId);

  return (
    <main className={`min-h-screen ${skin.bg} ${skin.text} pb-8`}>
      {/* Decorative gradient header */}
      <div
        className="relative w-full h-48 sm:h-64 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: skin.gradient }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Sticker */}
        {sticker && (
          <span
            className="absolute top-4 right-6 text-5xl select-none drop-shadow-lg rotate-12 animate-pulse"
            role="img"
            aria-label={sticker.label}
          >
            {sticker.emoji}
          </span>
        )}

        {/* Title */}
        <div className="relative z-10 text-center px-6">
          <p className="text-white/70 text-sm font-medium mb-1 tracking-widest uppercase">
            {mixtape.recipientName
              ? `A mixtape for ${mixtape.recipientName}`
              : "A mixtape for you"}
          </p>
          <h1 className="text-white text-3xl sm:text-4xl font-black drop-shadow-lg">
            {skin.icon} {skin.name}
          </h1>
          <p className="text-white/60 text-xs mt-2">
            {trackList.length} track{trackList.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10 space-y-4">
        {/* Note card */}
        {mixtape.note && (
          <div className={`${skin.card} border ${skin.border} rounded-2xl p-5 shadow-xl`}>
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2 font-semibold">
              A note
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {mixtape.note}
            </p>
          </div>
        )}

        {/* Player */}
        <Player tracks={trackList} skin={skin} />
      </div>
    </main>
  );
}
