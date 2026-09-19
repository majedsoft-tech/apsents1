import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Directory to store server-synced data persistently
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

const ATTENDANCE_FILE = path.join(DATA_DIR, "sync_attendance.json");
const BEHAVIORS_FILE = path.join(DATA_DIR, "sync_behaviors.json");
const DELAYS_FILE = path.join(DATA_DIR, "sync_delays.json");

// Helper to safely read JSON file
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as T;
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return fallback;
}

// Helper to safely write JSON file
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
  }
}

// In-memory caches for 0ms access
let attendanceCache: any[] = readJsonFile(ATTENDANCE_FILE, []);
let behaviorsCache: any[] = readJsonFile(BEHAVIORS_FILE, []);
let delaysCache: any[] = readJsonFile(DELAYS_FILE, []);

// Active Server-Sent Events clients for real-time pushing
type SSEClient = {
  id: string;
  res: express.Response;
  schoolCode?: string;
  email?: string;
};
const sseClients: Map<string, SSEClient> = new Map();

function broadcastSyncEvent(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
  sseClients.forEach((client, id) => {
    try {
      client.res.write(payload);
    } catch (_) {
      sseClients.delete(id);
    }
  });
}

// ----------------------------------------------------
// API ROUTES FIRST (Before Vite middleware)
// ----------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    attendanceCount: attendanceCache.length,
    behaviorsCount: behaviorsCache.length,
    delaysCount: delaysCache.length,
    sseClientsCount: sseClients.size,
    timestamp: Date.now()
  });
});

// Real-time SSE Stream for instant synchronization across all devices
app.get("/api/sync/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const schoolCode = (req.query.schoolCode as string || "").toLowerCase();
  const email = (req.query.email as string || "").toLowerCase();

  sseClients.set(clientId, { id: clientId, res, schoolCode, email });

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: "connected", clientId, timestamp: Date.now() })}\n\n`);

  req.on("close", () => {
    sseClients.delete(clientId);
  });
});

// Sync Attendance Endpoints
app.get("/api/sync/attendance", (req, res) => {
  const schoolCode = ((req.query.schoolCode as string) || "").toLowerCase().trim();
  const email = ((req.query.email as string) || "").toLowerCase().trim();
  const uid = ((req.query.uid as string) || "").trim();
  const date = ((req.query.date as string) || "").trim();

  let results = attendanceCache;

  if (date) {
    results = results.filter(r => r.date === date);
  }

  if (schoolCode || email || uid) {
    results = results.filter(r => {
      const rCode = (r.schoolCode || "").toLowerCase().trim();
      const rEmail = (r.userEmail || "").toLowerCase().trim();
      const rUid = (r.userId || "").trim();

      if (schoolCode && (rCode === schoolCode || rEmail === schoolCode || rUid === schoolCode)) return true;
      if (email && (rEmail === email || rCode === email)) return true;
      if (uid && (rUid === uid || rCode === uid)) return true;
      return false;
    });
  }

  res.json({ success: true, records: results });
});

app.post("/api/sync/attendance", (req, res) => {
  const { record, records } = req.body;
  const itemsToProcess = Array.isArray(records) ? records : (record ? [record] : []);

  if (itemsToProcess.length === 0) {
    return res.status(400).json({ success: false, error: "No records provided" });
  }

  let updatedCount = 0;
  for (const item of itemsToProcess) {
    if (!item || !item.id) continue;
    const existingIdx = attendanceCache.findIndex(r => r.id === item.id);
    if (existingIdx >= 0) {
      attendanceCache[existingIdx] = { ...attendanceCache[existingIdx], ...item, updatedAt: Date.now() };
    } else {
      attendanceCache.unshift({ ...item, updatedAt: Date.now() });
    }
    updatedCount++;
  }

  // Persist to disk asynchronously
  writeJsonFile(ATTENDANCE_FILE, attendanceCache);

  // Broadcast to all connected clients immediately
  broadcastSyncEvent("attendance_updated", itemsToProcess);

  res.json({ success: true, updatedCount });
});

// Sync Behavior Endpoints
app.get("/api/sync/behaviors", (req, res) => {
  const schoolCode = ((req.query.schoolCode as string) || "").toLowerCase().trim();
  const email = ((req.query.email as string) || "").toLowerCase().trim();
  const uid = ((req.query.uid as string) || "").trim();

  let results = behaviorsCache;
  if (schoolCode || email || uid) {
    results = results.filter(r => {
      const rCode = (r.schoolCode || "").toLowerCase().trim();
      const rEmail = (r.userEmail || "").toLowerCase().trim();
      const rUid = (r.userId || "").trim();
      if (schoolCode && (rCode === schoolCode || rEmail === schoolCode || rUid === schoolCode)) return true;
      if (email && (rEmail === email || rCode === email)) return true;
      if (uid && (rUid === uid || rCode === uid)) return true;
      return false;
    });
  }

  res.json({ success: true, records: results });
});

app.post("/api/sync/behaviors", (req, res) => {
  const { record, records } = req.body;
  const itemsToProcess = Array.isArray(records) ? records : (record ? [record] : []);

  if (itemsToProcess.length === 0) {
    return res.status(400).json({ success: false, error: "No behavior records provided" });
  }

  let updatedCount = 0;
  for (const item of itemsToProcess) {
    if (!item || !item.id) continue;
    const existingIdx = behaviorsCache.findIndex(r => r.id === item.id);
    if (existingIdx >= 0) {
      behaviorsCache[existingIdx] = { ...behaviorsCache[existingIdx], ...item, updatedAt: Date.now() };
    } else {
      behaviorsCache.unshift({ ...item, updatedAt: Date.now() });
    }
    updatedCount++;
  }

  writeJsonFile(BEHAVIORS_FILE, behaviorsCache);
  broadcastSyncEvent("behavior_updated", itemsToProcess);

  res.json({ success: true, updatedCount });
});

// Sync Morning Delays Endpoints
app.get("/api/sync/delays", (req, res) => {
  const schoolCode = ((req.query.schoolCode as string) || "").toLowerCase().trim();
  const email = ((req.query.email as string) || "").toLowerCase().trim();
  const uid = ((req.query.uid as string) || "").trim();
  const date = ((req.query.date as string) || "").trim();

  let results = delaysCache;
  if (date) {
    results = results.filter(r => r.date === date);
  }
  if (schoolCode || email || uid) {
    results = results.filter(r => {
      const rCode = (r.schoolCode || "").toLowerCase().trim();
      const rEmail = (r.userEmail || "").toLowerCase().trim();
      const rUid = (r.userId || "").trim();
      if (schoolCode && (rCode === schoolCode || rEmail === schoolCode || rUid === schoolCode)) return true;
      if (email && (rEmail === email || rCode === email)) return true;
      if (uid && (rUid === uid || rCode === uid)) return true;
      return false;
    });
  }

  res.json({ success: true, records: results });
});

app.post("/api/sync/delays", (req, res) => {
  const { record, records } = req.body;
  const itemsToProcess = Array.isArray(records) ? records : (record ? [record] : []);

  if (itemsToProcess.length === 0) {
    return res.status(400).json({ success: false, error: "No delay records provided" });
  }

  let updatedCount = 0;
  for (const item of itemsToProcess) {
    if (!item || !item.id) continue;
    const existingIdx = delaysCache.findIndex(r => r.id === item.id);
    if (existingIdx >= 0) {
      delaysCache[existingIdx] = { ...delaysCache[existingIdx], ...item, updatedAt: Date.now() };
    } else {
      delaysCache.unshift({ ...item, updatedAt: Date.now() });
    }
    updatedCount++;
  }

  writeJsonFile(DELAYS_FILE, delaysCache);
  broadcastSyncEvent("delay_updated", itemsToProcess);

  res.json({ success: true, updatedCount });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: "0.0.0.0" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
