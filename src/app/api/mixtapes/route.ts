import { NextRequest } from "next/server";
import { getDb } from "@/db";
import { mixtapes, tracks } from "@/db/schema";
import { nanoid } from "nanoid";

interface TrackInput {
  title: string;
  fileUrl: string;
  trackOrder: number;
}

interface MixtapeInput {
  skinId: number;
  stickerId: number | null;
  recipientName?: string;
  note: string;
  tracks: TrackInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: MixtapeInput = await request.json();
    const { skinId, stickerId, recipientName, note, tracks: trackList } = body;

    if (!skinId || !trackList?.length) {
      return Response.json(
        { error: "skinId and at least one track are required" },
        { status: 400 }
      );
    }

    const slug = nanoid(9); // 9-char URL-safe slug
    const creatorToken = nanoid(16); // 16-char owner token

    // Insert mixtape
    const db = getDb();
    const [mixtape] = await db
      .insert(mixtapes)
      .values({
        slug,
        skinId,
        stickerId: stickerId ?? null,
        recipientName: recipientName?.trim() || null,
        note: note ?? "",
        creatorToken,
      })
      .returning();

    // Insert tracks in order
    if (trackList.length > 0) {
      await db.insert(tracks).values(
        trackList.map((t) => ({
          mixtapeId: mixtape.id,
          fileUrl: t.fileUrl,
          title: t.title,
          trackOrder: t.trackOrder,
        }))
      );
    }

    return Response.json({ slug, id: mixtape.id, creatorToken }, { status: 201 });
  } catch (err) {
    console.error("[mixtapes POST]", err);
    return Response.json({ error: "Failed to save mixtape" }, { status: 500 });
  }
}
