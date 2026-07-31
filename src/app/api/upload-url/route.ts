import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_BASE = process.env.R2_PUBLIC_URL!; // e.g. https://pub-xxx.r2.dev or custom domain

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return Response.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    // Sanitize filename — keep extension, replace unsafe chars
    const ext = filename.split(".").pop()?.toLowerCase() ?? "mp3";
    const safeName = filename
      .replace(/\.[^.]+$/, "") // strip extension
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60);

    const key = `tracks/${randomUUID()}-${safeName}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 }); // 15 min

    const publicUrl = `${PUBLIC_BASE}/${key}`;

    return Response.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("[upload-url]", err);
    return Response.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
