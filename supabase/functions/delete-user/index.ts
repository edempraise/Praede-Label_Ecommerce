import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendMail } from "../_shared/mailer.ts";
import { getAttemptedUserDeletionEmailForAdmin } from "../_shared/email-templates.ts";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // 2. Get the user object from the token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);
    if (userError) {
      return new Response(
        JSON.stringify({ error: "Authentication failed: " + userError.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Check if the user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (adminCheckError || !adminCheck?.is_admin) {
      return new Response(
        JSON.stringify({ error: "Permission denied: User is not an admin." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Get the user_id to delete from the request body
    const { user_id_to_delete } = await req.json();
    if (!user_id_to_delete) {
      throw new Error("Missing user_id_to_delete in request body");
    }

    // 5. Fetch all admins' emails
    const { data: admins, error: adminError } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("is_admin", true);

    if (adminError) {
      throw new Error(`Failed to fetch admins: ${adminError.message}`);
    }

    // 6. Send email to all admins
    for (const admin of admins) {
      const email = getAttemptedUserDeletionEmailForAdmin(
        admin.email,
        user_id_to_delete,
        user.id
      );
      await sendMail(email);
    }

    // 7. Return a success response
    return new Response(
      JSON.stringify({
        message:
          "User deletion is disabled. An email has been sent to all admins.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
