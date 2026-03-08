import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 10MB." },
      { status: 400 },
    )
  }

  // Validate file type
  const ALLOWED_TYPES = [
    "text/markdown",
    "text/plain",
    "application/pdf",
    "text/csv",
    "application/json",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  const ALLOWED_EXTENSIONS = [
    ".md", ".txt", ".pdf", ".csv", ".json", ".doc", ".docx",
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
  ]

  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "")
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 400 },
    )
  }

  try {
    const blob = await put(`ideas/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type || ext,
    })
  } catch (err: any) {
    console.error("Upload failed:", err)
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 },
    )
  }
}
