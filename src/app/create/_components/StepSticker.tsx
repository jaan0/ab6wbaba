"use client";

import { STICKERS } from "@/lib/stickers";

interface StepStickerProps {
  selectedStickerId: number | null;
  onChange: (id: number | null) => void;
}

export default function StepSticker({
  selectedStickerId,
  onChange,
}: StepStickerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Add a sticker</h2>
        <p className="text-gray-400 text-sm">
          Optional — pick one to decorate your tape.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {/* No sticker option */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
            selectedStickerId === null
              ? "border-white bg-white/10 text-white scale-105"
              : "border-gray-700 bg-gray-800/50 text-gray-500 hover:border-gray-500"
          }`}
          aria-pressed={selectedStickerId === null}
          aria-label="No sticker"
        >
          None
        </button>

        {STICKERS.map((sticker) => {
          const isSelected = selectedStickerId === sticker.id;
          return (
            <button
              key={sticker.id}
              type="button"
              onClick={() => onChange(sticker.id)}
              className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-4xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
                isSelected
                  ? "border-white bg-white/10 scale-110 shadow-lg"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:scale-105"
              }`}
              aria-pressed={isSelected}
              aria-label={sticker.label}
              title={sticker.label}
            >
              <span role="img" aria-label={sticker.label}>
                {sticker.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {selectedStickerId !== null && (
        <p className="text-center text-gray-400 text-sm">
          Selected:{" "}
          <span className="text-white font-medium">
            {STICKERS.find((s) => s.id === selectedStickerId)?.emoji}{" "}
            {STICKERS.find((s) => s.id === selectedStickerId)?.label}
          </span>
        </p>
      )}
    </div>
  );
}
