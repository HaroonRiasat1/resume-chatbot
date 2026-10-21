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
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    server: { port: 5190 },
    plugins: [apiDevServer()],
  };
});
