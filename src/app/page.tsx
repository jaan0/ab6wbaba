import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full space-y-10">
        <div className="space-y-4">
          <div className="text-7xl animate-pulse">📼</div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            musictape
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Make a personalized mixtape for someone you care about.
            <br />
            Pick a vibe, add songs, write a note, share a link.
          </p>
        </div>

        <Link
          href="/create"
          id="create-mixtape-link"
          className="inline-block px-10 py-4 bg-gradient-to-r from-fuchsia-500 to-blue-500 hover:from-fuchsia-400 hover:to-blue-400 text-white font-bold text-lg rounded-2xl shadow-lg shadow-fuchsia-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Create a mixtape →
        </Link>

        <p className="text-gray-700 text-sm">
          No account needed. Free. Always.
        </p>
      </div>
    </main>
  );
}
