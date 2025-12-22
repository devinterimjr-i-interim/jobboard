import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request :Request) {

  const { path } = await request.json();
    const { data, error } = await supabaseAdmin.storage
        .from('video_job')
        .remove([`${path}`]);


   return NextResponse.json({ success: true, data });
}