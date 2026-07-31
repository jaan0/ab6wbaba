"use client";

const MAX_NOTE_LENGTH = 500;

interface StepNoteProps {
  recipientName: string;
  onRecipientNameChange: (name: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
}

export default function StepNote({
  recipientName,
  onRecipientNameChange,
  note,
  onNoteChange,
}: StepNoteProps) {
  const remaining = MAX_NOTE_LENGTH - note.length;
  const isNearLimit = remaining < 50;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Personalize</h2>
        <p className="text-gray-400 text-sm">
          Add who this mixtape is for and leave them a message.
        </p>
      </div>

      {/* Recipient Name Field */}
      <div>
        <label
          htmlFor="recipient-name"
          className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
        >
          Recipient Name (Optional)
        </label>
        <input
          type="text"
          id="recipient-name"
          value={recipientName}
          onChange={(e) => onRecipientNameChange(e.target.value.slice(0, 50))}
          placeholder="e.g. Alex, Sarah, My Bestie..."
          className="w-full bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Note Field */}
      <div className="relative">
        <label
          htmlFor="mixtape-note"
          className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
        >
          Personal Note (Optional)
        </label>
        <textarea
          id="mixtape-note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value.slice(0, MAX_NOTE_LENGTH))}
          placeholder="Hey, I made this for you because…"
          rows={5}
          className="w-full bg-gray-800/70 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder-gray-600 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          aria-label="Mixtape note"
          aria-describedby="note-char-count"
        />
        <p
          id="note-char-count"
          className={`absolute bottom-3 right-4 text-xs transition-colors ${
            isNearLimit ? "text-amber-400" : "text-gray-600"
          }`}
        >
          {remaining} left
        </p>
      </div>
    </div>
  );
}
