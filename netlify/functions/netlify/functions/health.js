import { getSupabase, json } from "./_supabase.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  const checks = {
    service: "ok",
    timestamp: new Date().toISOString(),
    database: "unknown",
    schema: "fraudgraph",
  };

  const supabase = getSupabase();

  if (!supabase) {
    checks.database = "nao_configurado";
    checks.hint =
      "Configure SUPABASE_URL e SUPABASE_SERVICE_KEY nas variaveis de ambiente do Netlify.";
    return json(200, {
      status: "degraded",
      message: "Sistema no ar, mas banco ainda nao conectado.",
      checks,
    });
  }

  try {
    const { error } = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true });

    if (error) {
      checks.database = "erro";
      checks.database_error = error.message;
      return json(200, {
        status: "degraded",
        message: "Banco conectado, mas tabelas ainda nao criadas.",
        checks,
      });
    }

    checks.database = "ok";
    return json(200, {
      status: "healthy",
      message: "FraudGraph AI operacional.",
      checks,
    });
  } catch (err) {
    checks.database = "erro";
    checks.database_error = String(err);
    return json(200, { status: "degraded", checks });
  }
}
