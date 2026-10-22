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
  const [expectedDigest, providedDigest] = await Promise.all([digest(expectedSecret), digest(providedSecret)]);
  let mismatch = 0;
  for (let i = 0; i < expectedDigest.length; i++) mismatch |= expectedDigest[i] ^ providedDigest[i];
  if (mismatch !== 0) return new Response("Unauthorized", { status: 401 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return new Response("Server configuration error", { status: 500 });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.rpc("consume_admin_bootstrap", { p_email: TARGET_EMAIL });
  if (error) {
    const alreadyUsed = error.message.includes("already consumed");
    return Response.json(
      { error: alreadyUsed ? "Bootstrap already used; no further changes allowed." : error.message },
      { status: alreadyUsed ? 409 : 400 },
    );
  }
  return Response.json({ success: true, account: data?.[0] ?? null });
});
