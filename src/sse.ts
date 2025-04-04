import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { createServer } from "./mcp-proxy.js";
import router from "./api.js";

const app = express();
app.use('/api', router)

const { server, cleanup } = await createServer();

const connections = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
  console.log("received connection from ip:", req.ip);
  const transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
  connections.set(req.ip || '', transport);

  server.onerror = (err) => {
    console.error(`server onerror: ${err.stack}`)
  }
});

app.post("/message", async (req, res) => {
  console.log("received message from ip:", req.ip);
  const transport = connections.get(req.ip || '');
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(404).send("No connection found for this IP address.");
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

// add signterm and sigint handlers
process.on("SIGTERM", async () => {
  console.log("received SIGTERM");
  await cleanup();
  await server.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("received SIGINT");
  await cleanup();
  await server.close();
  process.exit(0);
});