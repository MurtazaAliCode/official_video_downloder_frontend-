// server/job-queue.ts - Full processing logic here (no circular import)
import { stat } from 'fs/promises';
import path from 'path';
import { storage } from './storage.js';  // Storage import
import { downloadVideoWithYtDlp } from './utils/videoDownloader.js';  // Download import
import { getTitleFromYtDlp } from './yt-dlp-utils.js';  // Title import
import { log } from './vite.js';  // Log import

interface JobData {
    id: string;
    url: string;
    downloadFormat: string;
}

interface QueueJob {
    data: JobData;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

class SimpleJobQueue {
    private queue: QueueJob[] = [];
    private isProcessing = false;

    async add(jobData: JobData): Promise<string> {
        const job: QueueJob = {
            data: jobData,
            status: 'pending',
        };
        this.queue.push(job);
        console.log(`Added job to queue: ${jobData.id}`);

        if (!this.isProcessing) {
            this.processNext();
        }

        return jobData.id;
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const queueJob = this.queue.shift()!;  // First job lo
        const { id: jobId, url, downloadFormat } = queueJob.data;
        queueJob.status = 'processing';

        console.log(`Processing job from queue: ${jobId}`);

        try {
            // Update storage to 'processing' (frontend polling ke liye)
            await storage.updateJobStatus(jobId, 'processing', 5);

            // 1. Title fetch
            console.log(`🔍 Fetching title for ${jobId}...`);
            const title = await getTitleFromYtDlp(url);
            if (title) {
                // Title storage mein update (optional, status mein bhejte hain)
                await storage.updateJobStatus(jobId, 'processing', 10);  // Progress 10%
                log(`Job ${jobId}: Title fetched: ${title}`);
            }

            // 2. Download
            console.log(`⬇️ Starting download for ${jobId}...`);
            const outputPath = path.join(process.cwd(), 'downloads', `${jobId}.${downloadFormat}`);

            const result = await downloadVideoWithYtDlp(url, outputPath, downloadFormat, (progress: any) => {
                console.log(`📊 Progress for ${jobId}: ${progress}%`);
                // Storage update (throttled)
                if (progress % 10 === 0) {
                    storage.updateJobStatus(jobId, 'processing', 10 + Math.floor(progress * 0.8)).catch(err => console.error('Progress update error:', err));
                }
            });

            if (!result.success) {
                throw new Error(result.error || 'Download failed');
            }

            // 3. Finalize
            console.log(`🏁 Finalizing ${jobId}...`);
            const stats = await stat(outputPath);
            const downloadUrl = `/api/download/${jobId}`;

            await storage.updateJobOutput(jobId, outputPath);
            await storage.updateJobDownloadUrl(jobId, downloadUrl);
            await storage.updateJobStatus(jobId, 'completed', 100);

            log(`Job ${jobId} completed. File size: ${stats.size} bytes`);
            queueJob.status = 'completed';

        } catch (error) {
            console.error(`💥 Failed job ${jobId}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await storage.updateJobError(jobId, errorMessage);
            queueJob.status = 'failed';
        } finally {
            this.isProcessing = false;
            this.processNext();  // Next job
        }
    }

    getQueueLength(): number {
        return this.queue.length;
    }
}

export const jobQueue = new SimpleJobQueue();

export const addDownloadJob = async (jobData: JobData): Promise<string> => {
    console.log('Adding job to simple queue:', jobData.id);
    return await jobQueue.add(jobData);
};

console.log('Simple in-memory job queue with full processing initialized! (No circular imports)');