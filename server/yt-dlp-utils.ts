// @ts-ignore
import youtubedl from 'youtube-dl-exec';

/**
 * Fetch video title using youtube-dl-exec (wrapper for yt-dlp)
 */
export async function getTitleFromYtDlp(videoUrl: string): Promise<string | null> {
    try {
        console.log(`🔍 Fetching title for: ${videoUrl}`);

        // JSON dump (no download)
        const rawOutput = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
        });

        let jsonOutput: any;
        try {
            jsonOutput = JSON.parse(rawOutput as string);
        } catch (parseError) {
            console.error('Failed to parse yt-dlp JSON output:', parseError);
            return null;
        }

        const title = jsonOutput.title || 'Unknown Title';
        console.log(`✅ Title fetched: ${title}`);
        return title;

    } catch (error) {
        console.error('Title fetch error:', error);
        return null;
    }
}