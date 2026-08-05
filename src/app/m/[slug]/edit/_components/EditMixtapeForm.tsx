"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepSkin from "@/app/create/_components/StepSkin";
import StepSticker from "@/app/create/_components/StepSticker";
import StepTracks, { type TrackFile } from "@/app/create/_components/StepTracks";
import StepNote from "@/app/create/_components/StepNote";

type Step = 1 | 2 | 3 | 4;

interface MixtapeData {
  id: string;
  slug: string;
  skinId: number;
  stickerId: number | null;
  recipientName: string;
  note: string;
}

interface EditMixtapeFormProps {
  mixtape: MixtapeData;
  initialTracks: TrackFile[];
  hasCreatorToken: boolean;
}

type PublishState =
  | { status: "idle" }
  | { status: "uploading"; current: number; total: number }
  | { status: "saving" }
  | { status: "error"; message: string };

const STEP_LABELS = ["Theme", "Sticker", "Tracks", "Note"];

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = (i + 1) as Step;
        const isComplete = current > step;
        const isCurrent = current === step;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                isComplete
                  ? "bg-green-500 text-white"
                  : isCurrent
                  ? "bg-blue-500 text-white ring-2 ring-blue-300/50 ring-offset-2 ring-offset-gray-950"
                  : "bg-gray-800 text-gray-500"
              }`}
              aria-label={`Step ${step}: ${STEP_LABELS[i]}${isComplete ? " (completed)" : isCurrent ? " (current)" : ""}`}
            >
              {isComplete ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span
              className={`text-xs hidden sm:block transition-colors ${
                isCurrent ? "text-white font-medium" : "text-gray-600"
              }`}
            >
              {STEP_LABELS[i]}
            </span>
            {step < total && (
              <div
                className={`h-px w-4 sm:w-8 transition-colors ${
                  isComplete ? "bg-green-500" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

async function uploadFile(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });

  if (!res.ok) throw new Error("Failed to get upload URL");
  const { uploadUrl, publicUrl } = await res.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });

  return publicUrl;
}

export default function EditMixtapeForm({ mixtape, initialTracks, hasCreatorToken }: EditMixtapeFormProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState({
    skinId: mixtape.skinId,
    stickerId: mixtape.stickerId,
    tracks: initialTracks,
    recipientName: mixtape.recipientName,
    note: mixtape.note,
  });
  const [publishState, setPublishState] = useState<PublishState>({ status: "idle" });

  useEffect(() => {
    try {
      const keys = JSON.parse(localStorage.getItem("mixtape_keys") || "{}");
      let savedToken = keys[mixtape.slug];
      
      if (!savedToken && !hasCreatorToken) {
        // Generate a new 16-character token to claim ownership of legacy tape
        const newToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
        keys[mixtape.slug] = newToken;
        localStorage.setItem("mixtape_keys", JSON.stringify(keys));
        savedToken = newToken;
      }

      if (savedToken) {
        setToken(savedToken);
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch (e) {
      console.error("Failed to parse mixtape keys", e);
      setAuthorized(false);
    }
  }, [mixtape.slug, hasCreatorToken]);

  const updateTracks = useCallback((tracks: TrackFile[]) => {
    setState((prev) => ({ ...prev, tracks }));
  }, []);

  const canProceed = () => {
    if (step === 3 && state.tracks.length === 0) return false;
    return true;
  };

  const handleUpdate = async () => {
    if (state.tracks.length === 0) return;
    if (!token) return;

    // Filter tracks to find which ones need uploading (status !== "done")
    const updatedTracks: TrackFile[] = [...state.tracks];

    try {
      const tracksToUpload = state.tracks.filter(t => t.status !== "done");

      for (let i = 0; i < state.tracks.length; i++) {
        const track = state.tracks[i];
        if (track.status === "done" && track.publicUrl) {
          continue;
        }

        if (!track.file) {
          throw new Error(`File is missing for track: ${track.title}`);
        }

        setPublishState({
          status: "uploading",
          current: i + 1,
          total: state.tracks.length,
        });

        // Update track status to uploading
        updatedTracks[i] = { ...track, status: "uploading" };
        setState((prev) => ({ ...prev, tracks: [...updatedTracks] }));

        const publicUrl = await uploadFile(track.file, (pct) => {
          updatedTracks[i] = { ...updatedTracks[i], progress: pct };
          setState((prev) => ({ ...prev, tracks: [...updatedTracks] }));
        });

        updatedTracks[i] = { ...updatedTracks[i], status: "done", publicUrl, progress: 100 };
        setState((prev) => ({ ...prev, tracks: [...updatedTracks] }));
      }

      // Save to database via PUT
      setPublishState({ status: "saving" });
      const saveRes = await fetch(`/api/mixtapes/${mixtape.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinId: state.skinId,
          stickerId: state.stickerId,
          recipientName: state.recipientName,
          note: state.note,
          creatorToken: token,
          tracks: updatedTracks.map((t, idx) => ({
            title: t.title,
            fileUrl: t.publicUrl!,
            trackOrder: idx,
          })),
        }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update mixtape");
      }

      router.push(`/m/${mixtape.slug}`);
      router.refresh();
    } catch (err) {
      setPublishState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  if (authorized === null) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-white text-sm font-medium animate-pulse">
          Verifying ownership…
        </div>
      </main>
    );
  }

  if (authorized === false) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🔒</div>
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Access Denied</h1>
            <p className="text-gray-400 text-sm">
              Only the creator of this mixtape is authorized to edit it.
            </p>
          </div>
          <a
            href={`/m/${mixtape.slug}`}
            className="inline-block py-3 px-6 rounded-xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-gray-200 transition-all"
          >
            ← Back to Mixtape
          </a>
        </div>
      </main>
    );
  }

  const isPublishing =
    publishState.status === "uploading" || publishState.status === "saving";

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight">
            📼 Edit Mixtape
          </h1>
          <p className="text-gray-500 text-sm mt-1">Make adjustments to your creation</p>
        </div>

        <StepIndicator current={step} total={4} />

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Step content */}
          <div className="min-h-[320px] flex flex-col justify-center">
            {step === 1 && (
              <StepSkin
                selectedSkinId={state.skinId}
                onChange={(id) => setState((prev) => ({ ...prev, skinId: id }))}
              />
            )}
            {step === 2 && (
              <StepSticker
                selectedStickerId={state.stickerId}
                onChange={(id) => setState((prev) => ({ ...prev, stickerId: id }))}
              />
            )}
            {step === 3 && (
              <StepTracks tracks={state.tracks} onChange={updateTracks} />
            )}
            {step === 4 && (
              <StepNote
                recipientName={state.recipientName}
                onRecipientNameChange={(recipientName) =>
                  setState((prev) => ({ ...prev, recipientName }))
                }
                note={state.note}
                onNoteChange={(note) => setState((prev) => ({ ...prev, note }))}
              />
            )}
          </div>

          {/* Error */}
          {publishState.status === "error" && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-300 text-sm">
              {publishState.message}. Please try again.
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                if (step > 1) {
                  setStep((s) => (s - 1) as Step);
                } else {
                  router.push(`/m/${mixtape.slug}`);
                }
              }}
              disabled={isPublishing}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all disabled:opacity-50"
            >
              {step > 1 ? "← Back" : "Cancel"}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canProceed()}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-500 hover:bg-blue-400 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {step === 1
                  ? "Choose theme →"
                  : step === 2
                  ? "Add tracks →"
                  : "Write a note →"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isPublishing || state.tracks.length === 0}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-blue-500/20"
              >
                {isPublishing ? (
                  publishState.status === "uploading" ? (
                    `Uploading ${publishState.current}/${publishState.total}…`
                  ) : (
                    "Saving…"
                  )
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            )}
          </div>

          {/* Hint for step 3 */}
          {step === 3 && state.tracks.length === 0 && (
            <p className="text-center text-gray-600 text-xs mt-3">
              Add at least one track to continue.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
