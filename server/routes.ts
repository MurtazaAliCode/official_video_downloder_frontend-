import { Router, type Application } from "express";
import { type Request, Response } from "express";
import { storage } from "./storage.js";
import { addDownloadJob } from './job-queue';  // Simple queue ke liye
import { InsertJob } from "@shared/schema";
import { log } from "./vite.js";  // Log ke liye

// Setup Express Router
export const router = Router();

// Endpoint: Start download process
router.post("/download-video", async (req: Request, res: Response) => {
  const { url, format: downloadFormat, platform, options } = req.body;  // 'format' ko 'downloadFormat' mein rename (frontend match)

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const insertJob: InsertJob = {
      url,
      downloadFormat: downloadFormat || 'mp4',
      platform: platform || 'youtube',  // Default ya frontend se lo
      options: options || {}, // Add options property
    };

    const job = await storage.createJob(insertJob);

    // Queue mein add karo (simple queue auto-process karegi, full logic wahan)
    await addDownloadJob({
      id: job.id,
      url: job.url,
      downloadFormat: job.downloadFormat
    });

    // Client ko response dein
    return res.status(202).json({
      jobId: job.id,
      message: 'Download job created successfully.',
      status: job.status
    });
  } catch (error) {
    console.error("🚨 Download request initiation error:", error);  // Detailed log
    return res.status(500).json({
      message: "Failed to process download request.",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint: Check job status (Client polling)
router.get("/status/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;

  try {
    const job = await storage.getJob(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Security: Important fields wapas bhejen
    return res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      downloadUrl: job.downloadUrl,
      title: job.title,  // Frontend auto-download ke liye
      errorMessage: job.errorMessage,
    });
  } catch (error) {
    console.error(`Error fetching status for ${jobId}:`, error);
    return res.status(500).json({ message: "Error fetching status." });
  }
});

// Endpoint: Serve the final file
router.get("/download/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await storage.getJob(jobId);

  if (!job || job.status !== 'completed' || !job.outputPath) {
    return res.status(404).json({ message: "File not ready or job expired." });
  }

  try {
    // File ko client ko bhejen
    res.download(job.outputPath, `${job.title || 'video'}.${job.downloadFormat}`, (err) => {
      if (err) {
        console.error(`Error serving file for ${jobId}:`, err);
        res.status(500).send("Could not download the file.");
      }
    });
  } catch (error) {
    console.error(`Unexpected error in download endpoint for ${jobId}:`, error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export const registerRoutes = (app: Application) => {
  app.use('/api', router);
  return app;
};