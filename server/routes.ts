import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import {
  insertJobSchema,
  insertContactMessageSchema,
  downloadOptionsSchema,
  youtubeOptionsSchema,
  facebookOptionsSchema,
  instagramOptionsSchema,
  type Job,
} from "@shared/schema";
import { z } from "zod";

// URL validation helper functions
function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('instagram.com')) return 'instagram';
  return 'unknown';
}

function validateUrl(url: string): { valid: boolean; platform?: string; message?: string } {
  const platform = detectPlatform(url);
  if (platform === 'unknown') {
    return { valid: false, message: 'Unsupported platform. Only YouTube, Facebook, and Instagram URLs are supported.' };
  }
  try {
    new URL(url);
    return { valid: true, platform };
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }
}

// Simple job queue (would use BullMQ with Redis in production)
class SimpleJobQueue {
  private jobs: Map<string, Job> = new Map();
  private processing: Set<string> = new Set();

  async addJob(job: Job) {
    this.jobs.set(job.id, job);
    // Start processing immediately (in production, would use proper queue)
    this.processJob(job.id);
  }

  private async processJob(jobId: string) {
    if (this.processing.has(jobId)) return;
    
    this.processing.add(jobId);
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      await storage.updateJobStatus(jobId, 'processing', 0);
      
      // Simulate processing with progress updates
      for (let progress = 10; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await storage.updateJobStatus(jobId, 'processing', progress);
      }

      // Simulate video download process
      const outputExtension = `.${job.downloadFormat || 'mp4'}`;
      const outputPath = `/tmp/downloads/${jobId}${outputExtension}`;
      
      // Create output directory if it doesn't exist
      await fs.mkdir('/tmp/downloads', { recursive: true });
      
      // Simulate download (would use yt-dlp or similar in production)
      await this.simulateDownload(job.url, outputPath, job.platform);
      
      // Create a download URL for the file
      const downloadUrl = `/api/download/${jobId}`;
      
      await storage.updateJobOutput(jobId, outputPath);
      await storage.updateJobDownloadUrl(jobId, downloadUrl);
      await storage.updateJobStatus(jobId, 'completed', 100);
      
    } catch (error) {
      await storage.updateJobError(jobId, error instanceof Error ? error.message : 'Processing failed');
    } finally {
      this.processing.delete(jobId);
    }
  }

  private async simulateDownload(url: string, outputPath: string, platform: string): Promise<void> {
    // In production, this would use yt-dlp or similar tools
    // For demo purposes, create a placeholder file
    const placeholderContent = `Mock downloaded video from ${platform}: ${url}`;
    await fs.writeFile(outputPath, placeholderContent, 'utf8');
  }
}

const jobQueue = new SimpleJobQueue();

export async function registerRoutes(app: Express): Promise<Server> {
  // Video download endpoint
  app.post('/api/download-video', async (req, res) => {
    try {
      const { url, format = 'mp4', platform } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'Video URL is required' });
      }

      // Validate URL and platform
      const validation = validateUrl(url);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.message });
      }

      // Create job for video download
      const job = await storage.createJob({
        url,
        platform: validation.platform!,
        downloadFormat: format,
        options: { quality: 'high', format },
      });

      // Add job to queue for processing
      await jobQueue.addJob(job);

      res.json({ success: true, jobId: job.id });
    } catch (error) {
      console.error('Download request error:', error);
      res.status(500).json({ error: 'Failed to process download request' });
    }
  });

  // Alternative download endpoint with platform-specific validation
  app.post('/api/process-download', async (req, res) => {
    try {
      const { url, platform, format = 'mp4', options } = req.body;

      if (!url || !platform) {
        return res.status(400).json({ error: 'URL and platform are required' });
      }

      // Validate options based on platform
      let validatedOptions;
      switch (platform) {
        case 'youtube':
          validatedOptions = youtubeOptionsSchema.parse(options || {});
          break;
        case 'facebook':
          validatedOptions = facebookOptionsSchema.parse(options || {});
          break;
        case 'instagram':
          validatedOptions = instagramOptionsSchema.parse(options || {});
          break;
        default:
          return res.status(400).json({ error: 'Invalid platform' });
      }

      const job = await storage.createJob({
        url,
        platform,
        downloadFormat: format,
        options: validatedOptions,
      });

      // Add job to queue for processing
      await jobQueue.addJob(job);

      res.json({ success: true, jobId: job.id });
    } catch (error) {
      console.error('Process download error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid options', details: error.errors });
      }
      res.status(500).json({ error: 'Download processing failed' });
    }
  });

  // Job status endpoint
  app.get('/api/status/:jobId', async (req, res) => {
    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        outputPath: job.outputPath,
        errorMessage: job.errorMessage,
      });
    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  // File download endpoint
  app.get('/api/download/:jobId', async (req, res) => {
    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job || job.status !== 'completed' || !job.outputPath) {
        return res.status(404).json({ error: 'File not ready for download' });
      }

      // Check if file exists
      try {
        await fs.access(job.outputPath);
      } catch {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set appropriate headers
      const extension = path.extname(job.outputPath);
      const contentType = getContentType(extension);
      
      // Generate filename based on job info
      const fileName = `video_${job.platform}_${job.id}${extension}`;
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Stream the file
      const fileStream = await fs.readFile(job.outputPath);
      res.send(fileStream);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  });

  // Blog endpoints
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error('Blog posts error:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Blog post error:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedMessage = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedMessage);
      res.json({ success: true, id: message.id });
    } catch (error) {
      console.error('Contact error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid form data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Cleanup expired jobs (would be a cron job in production)
  setInterval(async () => {
    try {
      const expiredJobs = await storage.getExpiredJobs();
      for (const job of expiredJobs) {
        // Delete downloaded files
        try {
          if (job.outputPath) {
            await fs.unlink(job.outputPath);
          }
        } catch (error) {
          console.error('File cleanup error:', error);
        }
        // Delete job record
        await storage.deleteJob(job.id);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 60 * 60 * 1000); // Run every hour

  const httpServer = createServer(app);
  return httpServer;
}

function getContentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case '.mp4':
      return 'video/mp4';
    case '.avi':
      return 'video/x-msvideo';
    case '.mov':
      return 'video/quicktime';
    case '.mp3':
      return 'audio/mpeg';
    case '.wav':
      return 'audio/wav';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}
