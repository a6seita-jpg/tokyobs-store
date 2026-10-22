import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TARGET_EMAIL = "a6seita@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  const expectedSecret = Deno.env.get("ADMIN_BOOTSTRAP_SECRET");
  const providedSecret = req.headers.get("x-admin-bootstrap-secret");
  if (!expectedSecret || expectedSecret.length < 32 || !providedSecret) {
    return new Response("Bootstrap is not configured", { status: 503 });
  }

  const encoder = new TextEncoder();
  const digest = async (value: string) =>
    new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  const [expectedDigest, providedDigest] = await Promise.all([
    digest(expectedSecret),
    digest(providedSecret),
  ]);
  let mismatch = 0;
  for (let i = 0; i < expectedDigest.length; i++) mismatch |= expectedDigest[i] ^ providedDigest[i];
  if (mismatch !== 0) return new Response("Unauthorized", { status: 401 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Server configuration error", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // The email is hardcoded and the role condition makes this a one-way bootstrap:
  // only an account currently marked as "user" can be promoted.
  const { data, error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("email", TARGET_EMAIL)
    .eq("role", "user")
    .select("email, role")
    .maybeSingle();

  if (error) return Response.json({ error: "Could not update the target profile." }, { status: 500 });
  if (data) return Response.json({ success: true, account: data });

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("email", TARGET_EMAIL)
    .maybeSingle();

  if (lookupError) return Response.json({ error: "Could not verify the target profile." }, { status: 500 });
  if (!existing) return Response.json({ error: "Target profile not found." }, { status: 404 });
  if (existing.role === "admin") {
    return Response.json({ success: true, alreadyAdmin: true, account: existing });
  }
  return Response.json({ error: "Target profile was not promoted; current role is not eligible." }, { status: 409 });
});
