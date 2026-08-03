"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface VisitedMixtape {
  slug: string;
  name: string;
  timestamp: number;
}

export default function RecentMixtapes() {
  const [recentMixtapes, setRecentMixtapes] = useState<VisitedMixtape[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("visited_mixtapes");
      if (stored) {
        setRecentMixtapes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load visited mixtapes:", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded || recentMixtapes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Your Recent Mixtapes
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem("visited_mixtapes");
            setRecentMixtapes([]);
          }}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-2.5">
        {recentMixtapes.map((tape) => (
          <Link
            key={tape.slug}
            href={`/m/${tape.slug}`}
            className="flex items-center justify-between p-4 bg-gray-900/60 hover:bg-gray-900/90 border border-gray-800 hover:border-gray-700/80 rounded-2xl transition-all duration-200 group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 truncate">
              <span className="text-2xl select-none group-hover:scale-110 transition-transform duration-200">
                📼
              </span>
              <div className="text-left truncate">
                <p className="text-sm font-semibold text-white truncate">
                  {tape.name}
                </p>
                <p className="text-xs text-gray-500">
                  /m/{tape.slug}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 bg-gray-800 text-gray-300 rounded-xl group-hover:bg-gradient-to-r group-hover:from-fuchsia-500/20 group-hover:to-blue-500/20 group-hover:text-white group-hover:border-fuchsia-500/30 border border-transparent transition-all">
              Listen →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
