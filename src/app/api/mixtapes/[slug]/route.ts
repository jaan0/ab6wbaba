import { NextRequest } from "next/server";
import { getDb } from "@/db";
import { mixtapes, tracks } from "@/db/schema";
import { eq } from "drizzle-orm";

interface TrackInput {
  title: string;
  fileUrl: string;
  trackOrder: number;
}

interface UpdateMixtapeInput {
  skinId: number;
  stickerId: number | null;
  recipientName?: string;
  note: string;
  tracks: TrackInput[];
  creatorToken: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: UpdateMixtapeInput = await request.json();
    const { skinId, stickerId, recipientName, note, tracks: trackList, creatorToken } = body;

    if (!skinId || !trackList?.length) {
      return Response.json(
        { error: "skinId and at least one track are required" },
        { status: 400 }
      );
    }

    if (!creatorToken) {
      return Response.json(
        { error: "creatorToken is required for authorization" },
        { status: 401 }
      );
    }

    const db = getDb();

    // 1. Fetch existing mixtape to check ownership
    const [existing] = await db
      .select()
      .from(mixtapes)
      .where(eq(mixtapes.slug, slug))
      .limit(1);

    if (!existing) {
      return Response.json({ error: "Mixtape not found" }, { status: 404 });
    }

    // 2. Validate ownership token (only if the existing tape already has a token)
    if (existing.creatorToken && existing.creatorToken !== creatorToken) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3. Update mixtape details (save creatorToken if it was empty/legacy)
    await db
      .update(mixtapes)
      .set({
        skinId,
        stickerId: stickerId ?? null,
        recipientName: recipientName?.trim() || null,
        note: note ?? "",
        creatorToken: existing.creatorToken || creatorToken,
      })
      .where(eq(mixtapes.id, existing.id));

    // 4. Update tracks (Delete existing and insert updated list)
    await db.delete(tracks).where(eq(tracks.mixtapeId, existing.id));

    if (trackList.length > 0) {
      await db.insert(tracks).values(
        trackList.map((t) => ({
          mixtapeId: existing.id,
          fileUrl: t.fileUrl,
          title: t.title,
          trackOrder: t.trackOrder,
        }))
      );
    }

    return Response.json({ success: true, slug });
  } catch (err) {
    console.error("[mixtape PUT]", err);
    return Response.json({ error: "Failed to update mixtape" }, { status: 500 });
  }
}
