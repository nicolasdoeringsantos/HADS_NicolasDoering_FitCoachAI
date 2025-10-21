import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function getAuthenticatedUser(req: Request, supabaseAdmin: SupabaseClient) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    throw new Error("Invalid user token");
  }
  return user;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Carrega a chave da API do Gemini a partir das variáveis de ambiente do Supabase
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") as string);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") as string,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
    );

    const user = await getAuthenticatedUser(req, supabaseAdmin);
    const body = await req.json();
    const { prompt, context } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select(
        "nome, idade, sexo, altura, peso, objetivo, experiencia, restricao"
      )
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("User data fetch error:", userError);
      throw new Error("Error fetching user data.");
    }

    const userProfileContext = `
        User data:
        - Name: ${userData.nome || "Not provided"}
        - Age: ${userData.idade || "Not provided"}
        - Gender: ${userData.sexo || "Not provided"}
        - Height: ${userData.altura || "Not provided"} cm
        - Weight: ${userData.peso || "Not provided"} kg
        - Goal: ${userData.objetivo || "Not provided"}
        - Experience: ${userData.experiencia || "Not provided"}
        - Restrictions: ${userData.restricao || "None"}
        Use this information to personalize your answers.
      `.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = `${
      context || ""
    }\n\n${userProfileContext}\n\nUser: ${prompt}\n\nFitCoachAI:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes("auth") ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});