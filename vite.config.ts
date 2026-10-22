import { defineConfig, loadEnv, type Plugin } from "vite";

// Serves api/*.ts during `npm run dev`, the same handlers Vercel runs in production.
function apiDevServer(): Plugin {
  return {
    name: "api-dev-server",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res, next) => {
        const name = (req.url ?? "").split("?")[0].replace(/^\//, "");
        if (!/^[a-z-]+$/.test(name)) return next();
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const mod = await server.ssrLoadModule(`/api/${name}.ts`).catch(() => null);
        const handler = mod?.[req.method ?? "GET"];
        if (typeof handler !== "function") {
          res.statusCode = mod ? 405 : 404;
          return res.end();
        }
        const headers = new Headers();
        for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
        const response: Response = await handler(
          new Request(`http://localhost/api/${name}`, {
            method: req.method,
            headers,
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
