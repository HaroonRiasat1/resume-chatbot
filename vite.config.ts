import { defineConfig, loadEnv, type Plugin } from "vite";

// Serves api/chat.ts during `npm run dev`, the same handler Vercel runs in production.
function apiDevServer(): Plugin {
  return {
    name: "api-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const { POST } = await server.ssrLoadModule("/api/chat.ts");
        const response: Response = await POST(
          new Request("http://localhost/api/chat", {
            method: req.method,
            headers: { "Content-Type": "application/json" },
            body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
          }),
        );
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        if (!response.body) return res.end();
        for await (const part of response.body as unknown as AsyncIterable<Uint8Array>) res.write(part);
        res.end();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // loadEnv lets existing process.env values win, so clear the ones a previous
  // config load set; otherwise edits to .env.local are ignored after a restart.
  const g = globalThis as { __apiEnvKeys?: string[] };
  for (const key of g.__apiEnvKeys ?? []) delete process.env[key];
  const env = loadEnv(mode, process.cwd(), "");
  const added = Object.keys(env).filter((k) => !(k in process.env));
  Object.assign(process.env, Object.fromEntries(added.map((k) => [k, env[k]])));
  g.__apiEnvKeys = added;
  return {
    server: { port: 5190 },
    plugins: [apiDevServer()],
  };
});
