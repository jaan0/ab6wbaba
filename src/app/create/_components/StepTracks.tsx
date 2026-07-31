"use client";

import { useCallback, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface TrackFile {
  id: string; // local UUID for dnd-kit
  file: File;
  title: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
  publicUrl?: string;
}

interface StepTracksProps {
  tracks: TrackFile[];
  onChange: (tracks: TrackFile[]) => void;
}

const MAX_TRACKS = 12;

function SortableTrack({
  track,
  index,
  onTitleChange,
  onRemove,
}: {
  track: TrackFile;
  index: number;
  onTitleChange: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusIcon = {
    pending: <span className="text-gray-500 text-xs">waiting</span>,
    uploading: (
      <span className="text-blue-400 text-xs animate-pulse">uploading…</span>
    ),
    done: (
      <span className="text-green-400 text-xs">✓ done</span>
    ),
    error: <span className="text-red-400 text-xs">✗ error</span>,
  }[track.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-gray-800/70 rounded-xl px-4 py-3 border border-gray-700 group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        aria-label="Drag to reorder"
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
        </svg>
      </button>

      {/* Track number */}
      <span className="text-gray-600 text-sm w-5 text-right flex-shrink-0">
        {index + 1}
      </span>

      {/* Title input + progress */}
      <div className="flex-1 min-w-0 space-y-1">
        <input
          type="text"
          value={track.title}
          onChange={(e) => onTitleChange(track.id, e.target.value)}
          className="w-full bg-transparent text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:ring-0 border-b border-transparent focus:border-gray-600 transition-colors"
          placeholder="Track title"
          id={`track-title-${track.id}`}
          aria-label={`Track ${index + 1} title`}
        />
        {track.status === "uploading" && (
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${track.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex-shrink-0">{statusIcon}</div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(track.id)}
        aria-label={`Remove track ${index + 1}`}
        className="text-gray-700 hover:text-red-400 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function StepTracks({ tracks, onChange }: StepTracksProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const audioFiles = Array.from(files).filter((f) =>
        f.type.startsWith("audio/")
      );
      const remaining = MAX_TRACKS - tracks.length;
      const toAdd = audioFiles.slice(0, remaining);

      const newTracks: TrackFile[] = toAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        title: file.name.replace(/\.[^.]+$/, ""),
        progress: 0,
        status: "pending",
      }));

      onChange([...tracks, ...newTracks]);
    },
    [tracks, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);
      onChange(arrayMove(tracks, oldIndex, newIndex));
    }
  };

  const updateTitle = (id: string, title: string) => {
    onChange(tracks.map((t) => (t.id === id ? { ...t, title } : t)));
  };

  const removeTrack = (id: string) => {
    onChange(tracks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Add your tracks</h2>
        <p className="text-gray-400 text-sm">
          Upload up to {MAX_TRACKS} audio files. Drag to reorder.
        </p>
      </div>

      {/* Drop zone */}
      {tracks.length < MAX_TRACKS && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          aria-label="Upload audio files"
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
              : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/30"
          }`}
        >
          <div className="text-4xl mb-2">🎵</div>
          <p className="text-gray-300 font-medium">
            Drop audio files here or{" "}
            <span className="text-blue-400 underline">browse</span>
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {tracks.length}/{MAX_TRACKS} tracks — MP3, FLAC, WAV, M4A…
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            id="audio-file-input"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Track list */}
      {tracks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tracks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <SortableTrack
                  key={track.id}
                  track={track}
                  index={index}
                  onTitleChange={updateTitle}
                  onRemove={removeTrack}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {tracks.length === MAX_TRACKS && (
        <p className="text-center text-amber-400 text-sm">
          Maximum of {MAX_TRACKS} tracks reached.
        </p>
      )}
    </div>
  );
}
