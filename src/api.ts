import cors from 'cors';
import { json, Router } from "express";
import { Config, loadConfig, saveConfig, ServerConfig } from "./config.js";

const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production' ? (process.env.WEB_URL || '*') : 'http://localhost:3000',
  methods: ["GET", "POST", "DELETE"],
}

const router = Router()

router.use(cors(corsOptions))
router.use(json())

const { servers } = await loadConfig()

// Get all servers
router.get("/servers", async (_req, res) => {
  try {
    const config: Config = await loadConfig()
    res.json(config.servers)
  } catch (error) {
    console.error("Error reading servers:", error)
    res.status(500).json({ error: "Failed to read server configuration" })
  }
})

// Add or update server
router.post("/servers", async (req, res) => {
  try {
    const config: Config = await loadConfig()
    const newServer: ServerConfig = req.body

    const existingIndex = config.servers.findIndex(s => s.name === newServer.name)
    if (existingIndex >= 0) {
      config.servers[existingIndex] = newServer
    } else {
      config.servers.push(newServer)
    }

    await saveConfig(config)
    res.json(config.servers)
  } catch (error) {
    console.error("Error saving server:", error)
    res.status(500).json({ error: "Failed to save server configuration" })
  }
})

// Delete server
router.delete("/servers/:name", async (req, res) => {
  try {
    const config: Config = await loadConfig()
    config.servers = config.servers.filter(s => s.name !== req.params.name)
    await saveConfig(config)
    res.json(config.servers)
  } catch (error) {
    console.error("Error deleting server:", error)
    res.status(500).json({ error: "Failed to delete server" })
  }
})

router.get("/health", async (_req, res) => {
  try {
    const { servers: configured } = await loadConfig()
    const match = JSON.stringify(configured) === JSON.stringify(servers)
    if (!match) {
      console.info("changes detected. please restart the server")
    }
    res.json({ status: match ? "sync" : "unsync" })
  } catch (error: Error | any) {
    console.error("Error checking health:", error)
    res.json({ status: "error", error: error?.message || error })
  }
})

export default router