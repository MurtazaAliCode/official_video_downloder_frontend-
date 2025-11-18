import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LocalStorageManager } from "@/lib/storage-utils";
import type { Job } from "@shared/schema";

interface ProcessingOptions {
  action: string;
  filePath?: string;
  fileName: string;
  fileSize: number;
  options: Record<string, any>;
}

interface UseProcessingReturn {
  // State
  isUploading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  
  // Actions
  uploadFile: (file: File) => Promise<{ fileId: string } | null>;
  startProcessing: (options: ProcessingOptions) => Promise<{ jobId: string } | null>;
  
  // Current job tracking
  currentJobId: string | null;
  resetProcessing: () => void;
}

export function useProcessing(): UseProcessingReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        return await response.json();
      } finally {
        abortControllerRef.current = null;
      }
    },
    onSuccess: (data, file) => {
      // Save upload to local storage
      LocalStorageManager.saveUploadHistory({
        id: data.file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
      
      toast({
        title: "Upload successful",
        description: "Your video is ready for processing.",
      });
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Please try again with a different file.",
      });
    },
  });

  // Processing mutation
  const processingMutation = useMutation({
    mutationFn: async (options: ProcessingOptions) => {
      const response = await apiRequest('POST', '/api/process', options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }
      return response.json();
    },
    onSuccess: (data: { jobId: string }, options) => {
      const jobId = data.jobId;
      
      setCurrentJobId(jobId);
      
      // Save processing job to local storage
      LocalStorageManager.saveProcessingJob(jobId, {
        action: options.action,
        fileName: options.fileName,
        fileSize: options.fileSize,
        options: options.options,
      });
      
      toast({
        title: "Processing started",
        description: "Your video is being processed. This may take a few minutes.",
      });
    },
    onError: (error: Error) => {
      console.error('Processing error:', error);
      toast({
        variant: "destructive",
        title: "Processing failed", 
        description: error.message || "Please try again.",
      });
    },
  });

  // Upload file function
  const uploadFile = useCallback(async (file: File): Promise<{ fileId: string } | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);
      
      const result = await uploadMutation.mutateAsync(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return { fileId: result.file.id };
    } catch (error) {
      setUploadProgress(0);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [uploadMutation]);

  // Start processing function
  const startProcessing = useCallback(async (options: ProcessingOptions): Promise<{ jobId: string } | null> => {
    setIsProcessing(true);
    
    try {
      const data = await processingMutation.mutateAsync(options);
      return { jobId: data.jobId };
    } catch (error) {
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [processingMutation]);

  // Reset processing state
  const resetProcessing = useCallback(() => {
    // Cancel any ongoing upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsUploading(false);
    setIsProcessing(false);
    setUploadProgress(0);
    setCurrentJobId(null);
    
    // Reset mutations
    uploadMutation.reset();
    processingMutation.reset();
  }, [uploadMutation, processingMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isUploading,
    isProcessing,
    uploadProgress,
    uploadFile,
    startProcessing,
    currentJobId,
    resetProcessing,
  };
}

// Hook for tracking job status
export function useJobStatus(jobId: string | null) {
  return useQuery<Job>({
    queryKey: ['/api/status', jobId],
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if job is completed or failed
      if (!data || data.status === 'completed' || data.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    staleTime: 0, // Always fetch fresh data
  });
}

// Hook for managing processing history
export function useProcessingHistory() {
  const [history, setHistory] = useState(() => LocalStorageManager.getProcessingJobs());
  
  const refreshHistory = useCallback(() => {
    setHistory(LocalStorageManager.getProcessingJobs());
  }, []);
  
  const removeJob = useCallback((jobId: string) => {
    LocalStorageManager.removeProcessingJob(jobId);
    refreshHistory();
  }, [refreshHistory]);
  
  const clearHistory = useCallback(() => {
    Object.keys(history).forEach(jobId => {
      LocalStorageManager.removeProcessingJob(jobId);
    });
    refreshHistory();
  }, [history, refreshHistory]);
  
  useEffect(() => {
    // Refresh history when component mounts
    refreshHistory();
  }, [refreshHistory]);
  
  return {
    history,
    refreshHistory,
    removeJob,
    clearHistory,
  };
}

// Hook for download functionality
export function useDownload() {
  const { toast } = useToast();
  
  const downloadFile = useCallback(async (jobId: string, fileName?: string) => {
    try {
      const response = await fetch(`/api/download/${jobId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `processed_video_${jobId}`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your processed video is downloading.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [toast]);
  
  return { downloadFile };
}
