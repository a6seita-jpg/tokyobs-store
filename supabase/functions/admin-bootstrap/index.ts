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

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersError) return Response.json({ error: "Could not look up target account." }, { status: 500 });

  const target = usersData.users.find((user) => user.email?.toLowerCase() === TARGET_EMAIL);
  if (!target) return Response.json({ error: "Target account not found." }, { status: 404 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", target.id)
    .eq("role", "user")
    .select("id, role")
    .maybeSingle();

  if (profileError) {
    return Response.json({ error: "Could not update profile role.", details: profileError.message }, { status: 500 });
  }
  if (!profile) {
    return Response.json(
      { error: "No user-role profile was changed. The bootstrap may already have been used, or the profile schema differs." },
      { status: 409 },
    );
  }

  return Response.json({ success: true, account: TARGET_EMAIL, role: profile.role });
});
