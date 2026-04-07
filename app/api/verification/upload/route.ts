import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Uses the logged-in user's JWT for Storage + DB (same as /api/verification/status).
 * Avoids SUPABASE_SERVICE_ROLE_KEY here so a misconfigured service key cannot break uploads
 * ("Invalid Compact JWS"). Ensure bucket `id-documents` and `user_verifications` allow
 * authenticated users to upload/insert their own rows (see Supabase Storage + RLS policies).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("document") as File | null;
    const documentType = formData.get("documentType") as string | null;
    const dateOfBirth = formData.get("dateOfBirth") as string | null;

    if (!file || !documentType) {
      return NextResponse.json({ error: "Missing document or document type" }, { status: 400 });
    }

    if (!dateOfBirth) {
      return NextResponse.json({ error: "Date of birth is required" }, { status: 400 });
    }

    // Calculate age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const isOver18 = age >= 18;

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Upload JPEG, PNG, or PDF." }, { status: 400 });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from("id-documents")
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return NextResponse.json(
        { error: uploadErr.message || "Failed to upload document" },
        { status: 500 }
      );
    }

    const { error: insertErr } = await supabase.from("user_verifications").insert({
      user_id: user.id,
      method: "manual_upload",
      status: "pending",
      document_type: documentType,
      document_url: path,
    });

    if (insertErr) {
      console.error("Verification insert error:", insertErr);
      await supabase.storage.from("id-documents").remove([path]);
      return NextResponse.json({ error: "Failed to save verification record" }, { status: 500 });
    }

    const { error: metaErr } = await supabase.auth.updateUser({
      data: { verification_status: "pending", date_of_birth: dateOfBirth, is_over_18: isOver18 },
    });
    if (metaErr) {
      console.error("Metadata update error:", metaErr);
    }

    return NextResponse.json({ status: "pending", message: "Document uploaded. We'll review it shortly." });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
