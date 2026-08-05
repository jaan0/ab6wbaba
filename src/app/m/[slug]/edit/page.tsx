import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { mixtapes, tracks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import EditMixtapeForm from "./_components/EditMixtapeForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditPage({ params }: Props) {
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

  return (
    <EditMixtapeForm
      mixtape={{
        id: mixtape.id,
        slug: mixtape.slug,
        skinId: mixtape.skinId,
        stickerId: mixtape.stickerId,
        recipientName: mixtape.recipientName || "",
        note: mixtape.note,
      }}
      initialTracks={trackList.map((t) => ({
        id: t.id,
        title: t.title,
        publicUrl: t.fileUrl,
        progress: 100,
        status: "done" as const,
      }))}
    />
  );
}
