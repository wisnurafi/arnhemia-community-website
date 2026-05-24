import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const form = await request.formData();
  const withId = String(form.get("with") ?? "");
  if (!withId) {
    return NextResponse.redirect(new URL("/conversations", request.url));
  }

  const { data, error } = await supabase.rpc("open_conversation", {
    p_with: withId,
  });

  if (error || !data) {
    return NextResponse.redirect(
      new URL("/conversations?error=could_not_open", request.url),
    );
  }

  return NextResponse.redirect(
    new URL(`/conversations/${data}`, request.url),
  );
}
