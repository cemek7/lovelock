import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { nanoid } from "nanoid";
import { createServerClient } from "@/lib/supabase-server";
import { validateImageBuffer, checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`upload:${ip}`, 5, 60000)) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validationError = validateImageBuffer(buffer, file.type, file.size);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Compress with Sharp: max 1200x1200, JPEG 85%
    const compressed = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const fileName = `${nanoid(12)}.jpg`;
    const supabase = createServerClient();

    const { error: uploadError } = await supabase.storage
      .from("puzzle-images")
      .upload(fileName, compressed, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    return NextResponse.json({ image_path: fileName });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
