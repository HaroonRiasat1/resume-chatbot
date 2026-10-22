// Cross-origin access for haroonriasat.com and a small per-visitor rate limit.

const ALLOWED_ORIGINS = new Set([
  "https://haroonriasat.com",
  "https://www.haroonriasat.com",
  "http://localhost:5195",
  ...(process.env.ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
]);

export function isAllowedOrigin(origin: string | null): origin is string {
  return !!origin && ALLOWED_ORIGINS.has(origin);
}

// Only listed sites get CORS headers; same-origin requests (the chatbot itself) need none.
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": "X-Sources, X-Retrieval, X-Model",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}

// Sliding-window limit per visitor IP. It lives in this function instance's memory,
// so it is a speed bump against scripts rather than a hard global quota; the
// OpenAI account budget is the real backstop.
const hits = new Map<string, number[]>();

export function rateLimited(request: Request, bucket: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const ip =
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${bucket}:${ip}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded on long-lived instances
  return false;
}
