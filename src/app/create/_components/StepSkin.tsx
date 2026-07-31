"use client";

import { SKINS, SKIN_IDS } from "@/lib/skins";

interface StepSkinProps {
  selectedSkinId: number;
  onChange: (id: number) => void;
}

export default function StepSkin({ selectedSkinId, onChange }: StepSkinProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Choose your vibe</h2>
        <p className="text-gray-400 text-sm">Pick a visual theme for your mixtape.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SKIN_IDS.map((id) => {
          const skin = SKINS[id];
          const isSelected = selectedSkinId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`relative rounded-2xl overflow-hidden h-40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isSelected
                  ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-[1.02]"
                  : "opacity-75 hover:opacity-95 hover:scale-[1.01]"
              }`}
              aria-pressed={isSelected}
              aria-label={`Select ${skin.name} theme`}
            >
              {/* Gradient preview background */}
              <div
                className="absolute inset-0"
                style={{ background: skin.gradient }}
              />
              {/* Noise overlay for texture */}
              <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
                }}
              />
              {/* Content */}
              <div className="relative z-10 flex flex-col items-start justify-end h-full p-4">
                <span className="text-3xl mb-1">{skin.icon}</span>
                <span className="text-white font-bold text-base drop-shadow">{skin.name}</span>
              </div>
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
