// @ts-ignore
import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs/promises';

/**
 * Video download using youtube-dl-exec (wrapper for yt-dlp, auto-binary)
 * @param videoUrl - Video URL
 * @param outputPath - Save path
 * @param downloadFormat - 'mp4' or 'mp3'
 * @param onProgress - Progress callback (simulated, real via logs)
 * @returns Promise with result
 */
export async function downloadVideoWithYtDlp(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string = 'mp4',
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        console.log(`Starting ${downloadFormat} download with youtube-dl-exec: ${videoUrl}`);

        // Command options
        const options = {
            format: downloadFormat === 'mp3' ? 'bestaudio/best' : 'best[ext=mp4]/best',
            output: outputPath,  // Exact filename
            'no-warnings': true,
            'ignore-errors': true,  // Graceful fail
        };

        // Progress simulate (youtube-dl-exec logs se real progress parse kar sakte hain later)
        const startTime = Date.now();

        // Run download
        await youtubedl(videoUrl, options);

        const duration = Date.now() - startTime;
        console.log(`Download took ${duration}ms`);

        // File check
        await fs.access(outputPath);
        console.log(`Download successful: ${outputPath}`);
        onProgress?.(100);

        return { success: true, filePath: outputPath };

    } catch (error) {
        console.error('youtube-dl-exec download failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}