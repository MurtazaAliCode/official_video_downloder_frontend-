import express, { type Request, Response, NextFunction } from "express";
import http from "http"; // Import http module
import cors from "cors"; // CORS middleware import
// FIXED: Local imports mein .js extension add karna zaroori hai
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();

// CORS middleware setup
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
  }));
  log(`CORS enabled for origin: ${corsOrigin}`);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware: Safai ke liye accha hai
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // CRITICAL: Yahan aapki saari routes load hoti hain (routes.ts se)
  registerRoutes(app); // No need to await or capture return value here

  // Create HTTP server
  const server = http.createServer(app);

  // SANITY CHECK ROUTE: Yeh check karne ke liye ki Express theek se chal raha hai ya nahi.
  app.get('/api/status-check', (_req, res) => {
    res.json({ success: true, message: 'Server is running and routes are active!' });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Console mein error print karein takay debugging aasan ho
    console.error(`Unhandled API Error (${status}):`, err);

    res.status(status).json({ message });
    // throw err; <--- Is line ko hata diya gaya hai.
  });

  // Development mein Vite server set up karein, baaki mein static files serve karein
  if (app.get("env") === "development") {
    await setupVite(app, server); // Pass the http server
  } else {
    serveStatic(app);
  }

  // Server start karein
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({ // Listen on the http server
    port,
    host: "0.0.0.0",
    // 'reusePort: true' hata diya gaya hai
  }, () => {
    log(`serving on port ${port}`);
  });
})();
