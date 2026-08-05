"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Track } from "@/db/schema";
import type { Skin } from "@/lib/skins";

interface PlayerProps {
  tracks: Track[];
  skin: Skin;
  mixtapeSlug: string;
  mixtapeName: string;
  hasCreatorToken: boolean;
}

function formatTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player({ tracks, skin, mixtapeSlug, mixtapeName, hasCreatorToken }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  // Check if current user is owner
  useEffect(() => {
    try {
      const keys = JSON.parse(localStorage.getItem("mixtape_keys") || "{}");
      if (keys[mixtapeSlug] || !hasCreatorToken) {
        setIsOwner(true);
      }
    } catch (e) {
      console.error("Failed to read ownership keys:", e);
    }
  }, [mixtapeSlug, hasCreatorToken]);

  const current = tracks[currentIndex];

  // Save visited mixtape to localStorage
  useEffect(() => {
    try {
      const visitedStr = localStorage.getItem("visited_mixtapes") || "[]";
      const visited = JSON.parse(visitedStr) as Array<{
        slug: string;
        name: string;
        timestamp: number;
      }>;
      
      const filtered = visited.filter((item) => item.slug !== mixtapeSlug);
      const updated = [
        { slug: mixtapeSlug, name: mixtapeName, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 10);
      
      localStorage.setItem("visited_mixtapes", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save visited mixtape:", e);
    }
  }, [mixtapeSlug, mixtapeName]);

  // Load new track when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.src = current.fileUrl;
    audio.load();
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const playPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }, [playing]);

  const skipTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= tracks.length) return;
      setCurrentIndex(idx);
      setPlaying(true);
    },
    [tracks.length]
  );

  const handleEnded = useCallback(() => {
    if (currentIndex < tracks.length - 1) {
      skipTo(currentIndex + 1);
    } else {
      setPlaying(false);
      setCurrentTime(0);
    }
  }, [currentIndex, tracks.length, skipTo]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  // Progress %
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Track list */}
      <div className={`rounded-2xl border ${skin.border} ${skin.card} overflow-hidden`}>
        {tracks.map((track, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={track.id}
              type="button"
              id={`track-row-${idx}`}
              onClick={() => {
                if (isActive) {
                  playPause();
                } else {
                  skipTo(idx);
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-150 border-b last:border-b-0 ${skin.border} ${
                isActive
                  ? `${skin.accent} ${skin.accentText}`
                  : `hover:bg-white/10 ${skin.text}`
              }`}
              aria-label={`${isActive && playing ? "Pause" : "Play"} ${track.title}`}
              aria-pressed={isActive && playing}
            >
              {/* Play indicator */}
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {isActive && playing ? (
                  /* Animated bars */
                  <span className="flex gap-[2px] items-end h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-[3px] bg-current rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, height: "100%" }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className="opacity-60 text-xs">{idx + 1}</span>
                )}
              </div>
              <span className="flex-1 text-sm font-medium truncate">{track.title}</span>
            </button>
          );
        })}
      </div>

      {/* Controls bar */}
      <div className={`${skin.card} border ${skin.border} rounded-2xl p-4 space-y-3 sticky bottom-4`}>
        {/* Current track name */}
        <p className={`text-center text-sm font-semibold truncate ${skin.text}`}>
          {current?.title ?? "No track"}
        </p>

        {/* Seek bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek"
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-current"
            style={{ accentColor: "white" }}
          />
          <div className={`flex justify-between text-xs ${skin.text} opacity-60`}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Prev / Play-Pause / Next */}
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => skipTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            aria-label="Previous track"
            id="player-prev"
            className={`${skin.text} disabled:opacity-30 transition-opacity hover:scale-110 active:scale-95 transition-transform`}
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={playPause}
            aria-label={playing ? "Pause" : "Play"}
            id="player-play-pause"
            className={`w-14 h-14 rounded-full ${skin.accent} ${skin.accentText} flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95`}
          >
            {playing ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6zm8-14v14h4V5z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => skipTo(currentIndex + 1)}
            disabled={currentIndex >= tracks.length - 1}
            aria-label="Next track"
            id="player-next"
            className={`${skin.text} disabled:opacity-30 transition-opacity hover:scale-110 active:scale-95 transition-transform`}
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6zm8.5 0h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {isOwner && (
        <div className="flex justify-center pt-2">
          <Link
            href={`/m/${mixtapeSlug}/edit`}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-white/10 hover:bg-white/20 active:scale-95 border ${skin.border}`}
          >
            ✏️ Edit Mixtape
          </Link>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        preload="metadata"
        src={current?.fileUrl}
      />
    </div>
  );
}
