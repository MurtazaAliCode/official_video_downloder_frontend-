import { type Job, type InsertJob, type BlogPost, type InsertBlogPost, type ContactMessage, type InsertContactMessage } from "./shared/schema.js";
import { randomUUID } from "crypto";

export interface IStorage {
  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  updateJobStatus(id: string, status: string, progress?: number): Promise<void>;
  updateJobOutput(id: string, outputPath: string): Promise<void>;
  updateJobDownloadUrl(id: string, downloadUrl: string): Promise<void>;
  updateJobError(id: string, errorMessage: string): Promise<void>;
  getExpiredJobs(): Promise<Job[]>;
  deleteJob(id: string): Promise<void>;

  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private jobs: Map<string, Job> = new Map();
  private blogPosts: Map<string, BlogPost> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();

  constructor() {
    this.seedBlogPosts();
  }

  private seedBlogPosts() {
    const posts: InsertBlogPost[] = [
      {
        slug: 'how-to-compress-video-online',
        title: 'How to Compress Videos Online for Free',
        excerpt: 'Learn the best techniques for compressing your videos without losing quality. Perfect for social media and web publishing.',
        content: `# How to Compress Videos Online for Free

Video compression is essential for reducing file sizes while maintaining quality. Here's everything you need to know about compressing videos online.

## Why Compress Videos?

Large video files can be problematic for:
- Slow upload/download times
- Limited storage space
- Social media size restrictions
- Email attachment limits

## Best Practices for Video Compression

### 1. Choose the Right Quality Setting
- **High Quality**: Best for professional use, larger file size
- **Medium Quality**: Balanced option for most use cases
- **Low Quality**: Smallest file size, suitable for quick sharing

### 2. Understanding Video Codecs
H.264 is the most widely supported codec that offers good compression with maintained quality.

### 3. Optimize for Your Platform
Different platforms have different requirements:
- YouTube: 1080p recommended
- Instagram: 1080x1080 for square videos
- TikTok: 1080x1920 for vertical videos

## Using VidDonloader for Compression

1. Upload your video file
2. Select "Compress Video" option
3. Choose your quality preference
4. Click "Start Processing"
5. Download your compressed video

## Tips for Best Results

- Start with the highest quality source
- Test different compression settings
- Consider your audience's bandwidth
- Always preview before final download

Remember to keep your original files as backups!`,
        readTime: 5,
        published: true,
      },
      {
        slug: 'best-formats-for-social-media',
        title: 'Best Video Formats for Social Media Reels',
        excerpt: 'Discover the optimal video formats and settings for Instagram Reels, TikTok, and YouTube Shorts to maximize engagement.',
        content: `# Best Video Formats for Social Media Reels

Creating engaging social media content requires the right video format. Here's your complete guide to video formats for different platforms.

## Platform-Specific Requirements

### Instagram Reels
- **Format**: MP4
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Duration**: 15-90 seconds
- **File Size**: Under 100MB

### TikTok
- **Format**: MP4
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Duration**: 15 seconds to 10 minutes
- **File Size**: Under 2GB

### YouTube Shorts
- **Format**: MP4
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Duration**: Under 60 seconds
- **File Size**: Under 15GB

## Universal Best Practices

### Video Specifications
- **Codec**: H.264
- **Frame Rate**: 30fps (24fps for cinematic feel)
- **Bitrate**: 3,500-5,000 kbps for 1080p

### Audio Specifications
- **Codec**: AAC
- **Sample Rate**: 48kHz
- **Bitrate**: 128-320 kbps

## Tips for Maximum Engagement

1. **Hook viewers in the first 3 seconds**
2. **Use captions for accessibility**
3. **Optimize thumbnail selection**
4. **Keep videos mobile-friendly**
5. **Test different aspect ratios**

## Converting with VidDonloader

Use our format conversion tool to optimize your videos for any platform:

1. Upload your video
2. Select "Convert Format"
3. Choose MP4 output
4. Process and download

Quality content starts with the right format!`,
        readTime: 7,
        published: true,
      },
      {
        slug: 'trim-videos-without-software',
        title: 'Trim Videos Without Software',
        excerpt: 'Quick and easy ways to trim your videos online without downloading any software. Save time and storage space.',
        content: `# Trim Videos Without Software

Need to cut your videos but don't want to install heavy software? Online video trimming is the perfect solution.

## Why Trim Videos Online?

### Benefits:
- No software installation required
- Works on any device with internet
- Saves computer storage space
- Always up-to-date tools
- No learning curve for complex software

## When to Trim Videos

### Common Use Cases:
- Remove unwanted intro/outro sections
- Extract highlight clips
- Create shorter versions for social media
- Remove mistakes or pauses
- Split long videos into segments

## How to Trim Videos with VidDonloader

### Step-by-Step Guide:

1. **Upload Your Video**
   - Drag and drop or click to browse
   - Supports MP4, AVI, MOV formats
   - Maximum file size: 500MB

2. **Select Trim Option**
   - Choose "Trim Video" from the dropdown
   - Enter start time (HH:MM:SS format)
   - Enter end time (HH:MM:SS format)

3. **Preview Your Selection**
   - Double-check your time selections
   - Ensure you're capturing the right content

4. **Process and Download**
   - Click "Start Processing"
   - Wait for completion
   - Download your trimmed video

## Pro Tips for Video Trimming

### Accuracy Tips:
- Be precise with timestamps
- Allow 1-2 second buffer for smooth cuts
- Preview the original video first
- Note important timestamps before trimming

### Quality Considerations:
- Trim before compressing for best quality
- Keep original aspect ratio
- Consider fade-in/fade-out effects

## Best Practices

### Before You Start:
- Have a clear idea of what to keep
- Make note of exact timestamps
- Consider the final video's purpose
- Keep a backup of the original

### After Trimming:
- Review the trimmed video completely
- Check audio synchronization
- Verify the content makes sense
- Consider adding titles or transitions

## Common Trimming Mistakes to Avoid

1. **Cutting too close to speech**
2. **Not accounting for video buffering**
3. **Forgetting about audio fade**
4. **Removing important context**
5. **Not previewing before download**

Start trimming your videos efficiently with VidDonloader today!`,
        readTime: 4,
        published: true,
      },
      {
        slug: 'extract-audio-from-video-free',
        title: 'Extract Audio from Video Free',
        excerpt: 'Step-by-step guide to extracting high-quality audio from your videos for podcasts, music, or voiceovers.',
        content: `# Extract Audio from Video Free

Need to extract audio from your videos? Whether it's for podcasts, music, or voiceovers, here's how to do it for free.

## Why Extract Audio from Videos?

### Popular Use Cases:
- **Podcast Creation**: Convert video interviews to audio
- **Music Extraction**: Get audio tracks from music videos
- **Voiceover Work**: Extract narration for reuse
- **Sound Effects**: Pull specific audio clips
- **Audio Editing**: Work with audio separately

## Audio Format Options

### MP3 Format
- **Best for**: Music, podcasts, general use
- **File Size**: Smaller, compressed
- **Quality**: Good for most applications
- **Compatibility**: Universal support

### WAV Format
- **Best for**: Professional audio work
- **File Size**: Larger, uncompressed
- **Quality**: Highest fidelity
- **Compatibility**: Professional software

## How to Extract Audio with VidDonloader

### Simple Process:

1. **Upload Your Video File**
   - Supports MP4, AVI, MOV
   - Drag and drop interface
   - Up to 500MB file size

2. **Select Extract Audio**
   - Choose "Extract Audio" option
   - Select output format (MP3 or WAV)
   - Choose quality settings

3. **Process Your File**
   - Click "Start Processing"
   - Wait for extraction to complete
   - Progress bar shows status

4. **Download Your Audio**
   - Download link appears when ready
   - Files automatically deleted after 24 hours
   - Keep your extracted audio safe

## Quality Considerations

### For Best Results:
- Start with high-quality source video
- Choose WAV for professional work
- Use MP3 for sharing and storage
- Consider bitrate requirements

### Audio Settings Guide:
- **128 kbps**: Good for speech
- **192 kbps**: Better for music
- **320 kbps**: High quality music
- **Lossless**: Professional production

## Creative Applications

### Podcast Production:
1. Record video interviews
2. Extract audio for editing
3. Add intro/outro music
4. Publish as podcast episodes

### Music Projects:
1. Extract backing tracks
2. Isolate vocal performances
3. Create remix materials
4. Sample for new compositions

### Educational Content:
1. Convert video lectures to audio
2. Create downloadable resources
3. Enable offline learning
4. Reduce bandwidth usage

## Tips for Success

### Before Extraction:
- Check original video quality
- Note any audio issues
- Consider noise reduction needs
- Plan your output requirements

### After Extraction:
- Listen to the entire audio file
- Check for sync issues
- Consider additional editing
- Store in appropriate format

## Troubleshooting Common Issues

### No Audio in Output:
- Check source video has audio
- Verify volume levels
- Try different format

### Poor Audio Quality:
- Use higher bitrate settings
- Check source video quality
- Consider WAV format

### Large File Sizes:
- Use MP3 for smaller files
- Adjust bitrate settings
- Consider compression

Start extracting high-quality audio from your videos today with VidDonloader!`,
        readTime: 6,
        published: true,
      },
      {
        slug: 'add-watermark-to-videos',
        title: 'Add Watermark to Videos',
        excerpt: 'Protect your content and build your brand with custom watermarks. Learn best practices for placement and design.',
        content: `# Add Watermark to Videos

Protect your video content and build your brand with professional watermarks. Here's everything you need to know.

## Why Use Video Watermarks?

### Brand Protection:
- Prevent unauthorized use
- Maintain brand recognition
- Professional appearance
- Copyright protection

### Marketing Benefits:
- Increase brand awareness
- Drive traffic to your website
- Build brand consistency
- Professional credibility

## Types of Watermarks

### Text Watermarks
- **Best for**: Simple branding
- **Content**: Company name, website, copyright
- **Advantages**: Easy to read, small file impact
- **Use cases**: Basic brand protection

### Logo Watermarks
- **Best for**: Professional branding
- **Content**: Company logo, brand symbol
- **Advantages**: Visual recognition, brand building
- **Use cases**: Marketing videos, social content

## Watermark Placement Options

### Bottom Right
- **Most common placement**
- **Good for**: General content
- **Visibility**: High without obstruction
- **Professional standard**

### Bottom Left
- **Alternative placement**
- **Good for**: UI elements on right
- **Visibility**: High visibility
- **Less common but effective**

### Top Corners
- **Good for**: News-style content
- **Visibility**: Very prominent
- **Consider**: May obstruct titles
- **Use carefully**

## Best Practices for Watermarks

### Design Guidelines:
1. **Keep it subtle** - Don't overpower content
2. **Maintain readability** - Ensure text is clear
3. **Use transparency** - 50-70% opacity works well
4. **Choose contrasting colors** - Stand out from background
5. **Keep it proportional** - Scale with video size

### Size Recommendations:
- **Small videos**: 5-10% of frame width
- **HD videos**: 3-7% of frame width
- **4K videos**: 2-5% of frame width

## Adding Watermarks with VidDonloader

### Text Watermark Process:

1. **Upload Your Video**
   - Choose your video file
   - Ensure good source quality

2. **Select Watermark Option**
   - Choose "Add Watermark"
   - Select text watermark type

3. **Configure Settings**
   - Enter your watermark text
   - Choose position (bottom-right recommended)
   - Preview placement

4. **Process and Download**
   - Start processing
   - Download watermarked video

### Logo Watermark Process:

1. **Prepare Your Logo**
   - Use PNG format with transparency
   - Optimize size and quality
   - Ensure readable at small sizes

2. **Upload Files**
   - Upload your video
   - Upload your logo file

3. **Position and Process**
   - Choose logo placement
   - Adjust size if needed
   - Process your video

## Creative Watermark Ideas

### For Business:
- Company name + website
- Logo with tagline
- Contact information
- Social media handles

### For Content Creators:
- Channel name/logo
- Social media username
- Upload schedule reminder
- Call-to-action text

### For Events:
- Event name and date
- Sponsor logos
- Website/contact info
- Copyright notice

## Technical Considerations

### File Size Impact:
- Text watermarks: Minimal impact
- Logo watermarks: Slight increase
- Complex graphics: Larger files
- Transparency effects: Processing time

### Quality Maintenance:
- Use high-resolution logos
- Avoid over-compression
- Test on different devices
- Check readability

## Watermark Mistakes to Avoid

### Common Problems:
1. **Too large/obtrusive** - Distracts from content
2. **Poor contrast** - Hard to read
3. **Wrong placement** - Blocks important visuals
4. **Low quality graphics** - Looks unprofessional
5. **Inconsistent branding** - Confuses audience

### Solutions:
- Test different sizes
- Use contrasting colors
- Consider content layout
- Use high-resolution assets
- Maintain brand guidelines

## Legal Considerations

### Copyright Protection:
- Watermarks help but aren't foolproof
- Register important content
- Include copyright notices
- Monitor for unauthorized use

### Fair Use:
- Understand fair use limitations
- Watermarks don't prevent fair use
- Consider licensing options
- Seek legal advice for valuable content

Start protecting your video content with professional watermarks using VidDonloader today!`,
        readTime: 5,
        published: true,
      }
    ];

    posts.forEach(post => {
      const id = randomUUID();
      const blogPost: BlogPost = {
        ...post,
        id,
        author: post.author || 'VidDonloader Team',
        published: post.published ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.blogPosts.set(id, blogPost);
    });
  }

  // Job methods
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      title: null,
      downloadFormat: insertJob.downloadFormat || 'mp4',
      status: 'pending',
      progress: 0,
      outputPath: null,
      downloadUrl: null,
      errorMessage: null,
      createdAt: new Date(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async updateJobStatus(id: string, status: string, progress?: number): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.status = status;
      if (progress !== undefined) {
        job.progress = progress;
      }
      if (status === 'completed' || status === 'failed') {
        job.completedAt = new Date();
      }
      this.jobs.set(id, job);
    }
  }

  async updateJobOutput(id: string, outputPath: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.outputPath = outputPath;
      this.jobs.set(id, job);
    }
  }

  async updateJobDownloadUrl(id: string, downloadUrl: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.downloadUrl = downloadUrl;
      this.jobs.set(id, job);
    }
  }

  async updateJobError(id: string, errorMessage: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.errorMessage = errorMessage;
      job.status = 'failed';
      job.completedAt = new Date();
      this.jobs.set(id, job);
    }
  }

  async getExpiredJobs(): Promise<Job[]> {
    const now = new Date();
    return Array.from(this.jobs.values()).filter(job => job.expiresAt < now);
  }

  async deleteJob(id: string): Promise<void> {
    this.jobs.delete(id);
  }

  // Blog Post methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.published)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      post => post.slug === slug && post.published
    );
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      ...insertPost,
      id,
      author: insertPost.author || 'VidDonloader Team',
      published: insertPost.published ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const post = this.blogPosts.get(id);
    if (!post) {
      throw new Error('Blog post not found');
    }
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  // Contact Message methods
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
