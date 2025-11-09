import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createServer } from "http";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";

import bodyParser from "body-parser";
import { currentPath, loadProxies, loadUserAgents } from "./fileLoader.js";
import { filterProxies } from "./proxyUtils.js";
import { AccountManager } from "./utils/accountManager.js";

// Kick viewer worker
const kickViewerWorker = "./workers/kickViewer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __prod = process.env.NODE_ENV === "production";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: __prod ? "" : "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

const proxies = loadProxies();
const userAgents = loadUserAgents();

// Initialize account manager
const accountManager = new AccountManager();

console.log("Proxies loaded:", proxies.length);
console.log("User agents loaded:", userAgents.length);
console.log("Kick accounts loaded:", accountManager.getActiveAccountCount());

app.use(express.static(join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.emit("viewerStats", {
    activeViewers: 0,
    totalConnections: proxies.length,
    totalViewTime: 0,
    availableAccounts: accountManager.getActiveAccountCount(),
    log: "🎥 Connected to Kick Viewer Tester.",
  });

  socket.on("startViewerTest", (params) => {
    const { channelUrl, anonymousViewers, authenticatedViewers, duration } =
      params;

    if (!channelUrl || !channelUrl.trim()) {
      socket.emit("viewerStats", {
        log: "❌ Please provide a valid Kick channel URL",
      });
      return;
    }

    const filteredProxies = filterProxies(proxies);
    const workers: Worker[] = [];

    socket.emit("viewerStats", {
      log: `🚀 Starting viewer test for: ${channelUrl}`,
      totalConnections: anonymousViewers + authenticatedViewers,
    });

    for (let i = 0; i < anonymousViewers; i++) {
      if (i >= filteredProxies.length) {
        socket.emit("viewerStats", {
          log: `⚠️ Not enough proxies for ${anonymousViewers} viewers. Using ${filteredProxies.length} instead.`,
        });
        break;
      }

      const proxy = filteredProxies[i % filteredProxies.length];
      const userAgent = userAgents[i % userAgents.length];

      const worker = new Worker(join(__dirname, kickViewerWorker), {
        workerData: {
          channelUrl,
          viewerMode: "anonymous",
          proxy,
          userAgent,
          duration,
          account: null,
        },
      });

      worker.on("message", (message) => socket.emit("viewerStats", message));

      worker.on("error", (error) => {
        console.error(`Worker error: ${error.message}`);
        socket.emit("viewerStats", {
          log: `❌ Worker error: ${error.message}`,
        });
      });

      worker.on("exit", (code) => {
        console.log(`Anonymous viewer worker exited with code ${code}`);
      });

      workers.push(worker);
    }

    for (let i = 0; i < authenticatedViewers; i++) {
      const account = accountManager.getAvailableAccount();

      if (!account) {
        socket.emit("viewerStats", {
          log: `⚠️ No more accounts available. Started ${i} authenticated viewers.`,
        });
        break;
      }

      const proxyIndex = (anonymousViewers + i) % filteredProxies.length;
      const proxy = filteredProxies[proxyIndex];
      const userAgent = userAgents[proxyIndex % userAgents.length];

      const worker = new Worker(join(__dirname, kickViewerWorker), {
        workerData: {
          channelUrl,
          viewerMode: "authenticated",
          proxy,
          userAgent,
          duration,
          account,
        },
      });

      worker.on("message", (message) => socket.emit("viewerStats", message));

      worker.on("error", (error) => {
        console.error(`Authenticated worker error: ${error.message}`);
        socket.emit("viewerStats", {
          log: `❌ Authenticated worker error: ${error.message}`,
        });
      });

      worker.on("exit", (code) => {
        console.log(`Authenticated viewer worker exited with code ${code}`);
        accountManager.releaseAccount(account.username);
      });

      workers.push(worker);
    }

    socket.emit("viewerStats", {
      log: `✅ Started ${workers.length} total viewers (${anonymousViewers} anonymous, ${authenticatedViewers} authenticated)`,
      activeViewers: workers.length,
    });

    socket["viewerWorkers"] = workers;

    let finishedCount = 0;
    workers.forEach((worker) => {
      worker.on("exit", () => {
        finishedCount++;
        if (finishedCount === workers.length) {
          socket.emit("testEnd");
          socket.emit("viewerStats", {
            log: "🏁 All viewer sessions completed",
            activeViewers: 0,
          });
        }
      });
    });
  });

  socket.on("stopViewerTest", () => {
    const workers = socket["viewerWorkers"];
    if (workers && Array.isArray(workers)) {
      workers.forEach((worker) => {
        try {
          worker.terminate();
        } catch (err) {
          console.error("Error terminating worker:", err);
        }
      });
      socket.emit("testEnd");
      socket.emit("viewerStats", {
        log: "⏹️ Viewer test stopped",
        activeViewers: 0,
      });
    }
  });

  socket.on("disconnect", () => {
    const workers = socket["viewerWorkers"];
    if (workers && Array.isArray(workers)) {
      workers.forEach((worker) => {
        try {
          worker.terminate();
        } catch (err) {
          console.error("Error terminating worker on disconnect:", err);
        }
      });
    }
    console.log("Client disconnected");
  });
});

app.get("/configuration", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Content-Type", "application/json");

  const proxiesText = readFileSync(join(currentPath(), "data", "proxies.txt"), "utf-8");
  const uasText = readFileSync(join(currentPath(), "data", "uas.txt"), "utf-8");
  
  let accountsText = "[]";
  const accountsPath = join(currentPath(), "data", "accounts.json");
  if (existsSync(accountsPath)) {
    accountsText = readFileSync(accountsPath, "utf-8");
  }

  res.send({
    proxies: btoa(proxiesText),
    uas: btoa(uasText),
    accounts: btoa(accountsText),
    hasAccounts: accountManager.getActiveAccountCount() > 0,
  });
});

app.options("/configuration", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.send();
});

app.post("/configuration", bodyParser.json(), (req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Content-Type", "application/text");

  const proxies = atob(req.body["proxies"]);
  const uas = atob(req.body["uas"]);
  
  writeFileSync(join(currentPath(), "data", "proxies.txt"), proxies, { encoding: "utf-8" });
  writeFileSync(join(currentPath(), "data", "uas.txt"), uas, { encoding: "utf-8" });

  if (req.body["accounts"]) {
    const accounts = atob(req.body["accounts"]);
    writeFileSync(join(currentPath(), "data", "accounts.json"), accounts, { encoding: "utf-8" });
    accountManager.loadAccounts();
  }

  res.send("OK");
});

const PORT = parseInt(process.env.PORT || "3000");
httpServer.listen(PORT, () => {
  if (__prod) {
    console.log(
      `(Production Mode) Client and server is running under http://localhost:${PORT}`
    );
  } else {
    console.log(`Server is running under development port ${PORT}`);
  }
});
