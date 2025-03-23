import cors from 'cors';
import { json, Router } from "express";
import { Config, loadConfig, saveConfig, ServerConfig } from "./config.js";
import jwt from 'jsonwebtoken';

const { servers } = await loadConfig()

const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production' ? (process.env.WEB_URL || '*') : 'http://localhost:3000',
  methods: ["GET", "POST", "DELETE"],
}

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASS) {
  console.warn('Warning: ADMIN_PASSWORD not set, using default password "admin"');
}

router.use(cors(corsOptions))
router.use(json())

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Login endpoint
router.post("/auth", async (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USER && password === (ADMIN_PASS || 'admin')) {
    const token = jwt.sign({ username }, JWT_SECRET, {
      expiresIn: '24h'
    });
    
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protect all other routes
router.use(authMiddleware);

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