import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DownloadLink } from "@/components/video/download-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Job } from "@shared/schema";

interface ProcessingPageProps {
  params: {
    jobId: string;
  };
}

export default function Processing({ params }: ProcessingPageProps) {
  const [, setLocation] = useLocation();
  const { jobId } = params;
  
  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ['/api/status', jobId],
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if job is completed or failed
      return data?.status === 'completed' || data?.status === 'failed' ? false : 2000;
    },
    enabled: !!jobId,
  });

  const handleProcessAnother = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Job not found</h1>
            <p className="text-muted-foreground mb-8">
              The processing job you're looking for doesn't exist or has expired.
            </p>
            <button
              onClick={handleProcessAnother}
              className="btn-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Video Processing</h1>
            <p className="text-muted-foreground">
              {job.status === 'completed' 
                ? 'Your video has been processed successfully!' 
                : job.status === 'failed'
                ? 'Processing failed. Please try again.'
                : 'Processing your video...'}
            </p>
          </div>

          {job.status === 'completed' ? (
            <DownloadLink
              jobId={jobId}
              fileName="video" // Would get actual filename from job data
              onProcessAnother={handleProcessAnother}
            />
          ) : job.status === 'failed' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Processing Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {job.errorMessage || 'An error occurred during processing.'}
                </p>
                <button
                  onClick={handleProcessAnother}
                  className="w-full btn-gradient text-primary-foreground py-3 rounded-lg font-medium"
                >
                  Try Again
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Processing Your Video</CardTitle>
                  <p className="text-muted-foreground">
                    This may take a few moments depending on file size...
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProgressBar value={job.progress || 0} />
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">
                      {job.status === 'processing' ? 'Processing video...' : 'Preparing for processing...'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
