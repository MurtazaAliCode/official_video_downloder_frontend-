// FFmpeg utility functions for video processing
// Note: This is a frontend utility for validating options and providing helpers
// Actual processing happens on the backend

export interface CompressionOptions {
  quality: 'high' | 'medium' | 'low';
}

export interface ConversionOptions {
  format: 'mp4' | 'avi' | 'mov' | 'gif';
}

export interface TrimOptions {
  startTime: string; // HH:MM:SS format
  endTime: string;   // HH:MM:SS format
}

export interface ExtractOptions {
  format: 'mp3' | 'wav';
}

export interface WatermarkOptions {
  text?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  logoPath?: string;
}

export type ProcessingAction = 'compress' | 'convert' | 'trim' | 'extract' | 'watermark';

export interface ProcessingJob {
  action: ProcessingAction;
  options: CompressionOptions | ConversionOptions | TrimOptions | ExtractOptions | WatermarkOptions;
}

// Utility functions for validation and formatting

export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return timeRegex.test(time);
}

export function timeToSeconds(time: string): number {
  if (!validateTimeFormat(time)) {
    throw new Error('Invalid time format. Use HH:MM:SS');
  }
  
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function validateTrimOptions(options: TrimOptions): { valid: boolean; error?: string } {
  if (!validateTimeFormat(options.startTime)) {
    return { valid: false, error: 'Invalid start time format. Use HH:MM:SS' };
  }
  
  if (!validateTimeFormat(options.endTime)) {
    return { valid: false, error: 'Invalid end time format. Use HH:MM:SS' };
  }
  
  const startSeconds = timeToSeconds(options.startTime);
  const endSeconds = timeToSeconds(options.endTime);
  
  if (startSeconds >= endSeconds) {
    return { valid: false, error: 'End time must be after start time' };
  }
  
  return { valid: true };
}

export function getCompressionSettings(quality: string): { crf: number; preset: string } {
  switch (quality) {
    case 'high':
      return { crf: 18, preset: 'slow' };
    case 'medium':
      return { crf: 23, preset: 'medium' };
    case 'low':
      return { crf: 28, preset: 'fast' };
    default:
      return { crf: 23, preset: 'medium' };
  }
}

export function getOutputExtension(action: ProcessingAction, options: any): string {
  switch (action) {
    case 'convert':
      return options.format === 'gif' ? '.gif' : `.${options.format}`;
    case 'extract':
      return options.format === 'wav' ? '.wav' : '.mp3';
    case 'compress':
    case 'trim':
    case 'watermark':
    default:
      return '.mp4';
  }
}

export function estimateProcessingTime(fileSizeBytes: number, action: ProcessingAction): number {
  // Rough estimates in seconds based on file size and action
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  switch (action) {
    case 'compress':
      return Math.max(30, fileSizeMB * 2); // 2 seconds per MB, min 30 seconds
    case 'convert':
      return Math.max(20, fileSizeMB * 1.5); // 1.5 seconds per MB
    case 'trim':
      return Math.max(15, fileSizeMB * 0.5); // 0.5 seconds per MB (fastest)
    case 'extract':
      return Math.max(10, fileSizeMB * 0.3); // Audio extraction is fast
    case 'watermark':
      return Math.max(25, fileSizeMB * 1.8); // Overlay processing
    default:
      return Math.max(30, fileSizeMB * 2);
  }
}

export function getSupportedFormats(): any {
  return {
    input: ['mp4', 'avi', 'mov', 'quicktime', 'x-msvideo'],
    output: {
      video: ['mp4', 'avi', 'mov', 'gif'],
      audio: ['mp3', 'wav']
    }
  };
}

export function validateFileType(file: File): { valid: boolean; error?: string } {
  const supportedTypes = [
    'video/mp4',
    'video/avi', 
    'video/quicktime',
    'video/x-msvideo'
  ];
  
  if (!supportedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Unsupported file type. Please use MP4, AVI, or MOV files.' 
    };
  }
  
  // Check file size (500MB limit)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File size exceeds 500MB limit.' 
    };
  }
  
  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

// Quality recommendations based on use case
export function getQualityRecommendation(useCase: string): CompressionOptions['quality'] {
  switch (useCase.toLowerCase()) {
    case 'social':
    case 'instagram':
    case 'tiktok':
      return 'medium';
    case 'youtube':
    case 'professional':
      return 'high';
    case 'email':
    case 'messaging':
      return 'low';
    default:
      return 'medium';
  }
}
