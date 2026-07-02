// supabase/functions/gerar-laudo/index.ts
// Deploy: supabase functions deploy gerar-laudo
// Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let prompt: string | undefined;
  try {
    ({ prompt } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "corpo invalido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!prompt || typeof prompt !== "string") {
    return new Response(JSON.stringify({ error: "prompt obrigatorio" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": ANTHROPIC_API_KEY ?? "",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await anthropicRes.json();
  return new Response(JSON.stringify(data), {
    status: anthropicRes.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
