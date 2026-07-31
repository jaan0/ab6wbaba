import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="text-6xl">😶‍🌫️</div>
        <h1 className="text-3xl font-bold text-white">Mixtape not found</h1>
        <p className="text-gray-500">
          This link may be expired or the mixtape doesn&apos;t exist.
        </p>
        <Link
          href="/create"
          className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
        >
          Make your own →
        </Link>
      </div>
    </main>
  );
}
