import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner, AdSidebar } from "@/components/layout/AdSlots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Download, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("mp4");

  const detectPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    return 'unknown';
  };

  const validateUrl = (url: string) => {
    const platform = detectPlatform(url);
    if (platform === 'unknown') {
      return { valid: false, message: 'Please enter a valid YouTube, Facebook, or Instagram video URL' };
    }
    try {
      new URL(url);
      return { valid: true, platform };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  };

  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL Required",
        description: "Please enter a video URL to download.",
      });
      return;
    }

    const validation = validateUrl(videoUrl);
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: validation.message,
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const response = await apiRequest('POST', '/api/download-video', {
        url: videoUrl,
        format: downloadFormat,
        platform: validation.platform,
      });
      
      const result = await response.json();
      
      // Redirect to processing page
      setLocation(`/processing/${result.jobId}`);
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Please check the URL and try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdBanner />
      
      {/* Hero Section */}
      <section className="min-h-screen dark:gradient-bg-dark gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-background/5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Download Videos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                in MP4 Format
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Download videos from YouTube, Facebook, and Instagram in MP4 format. Fast, free, and easy to use.
            </p>
          </div>

          {/* Main Content Area */}
          <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
            {/* URL Input and Download Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* URL Input Box */}
              <Card>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Link className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-2">
                        Enter Video URL
                      </h3>
                      <p className="text-muted-foreground">
                        Paste the URL of the video you want to download
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="text-lg py-6"
                        data-testid="video-url-input"
                      />
                      
                      {/* Platform Logos */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">Supported platforms:</p>
                        <div className="flex justify-center items-center space-x-8">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">YT</span>
                            </div>
                            <span className="text-xs text-muted-foreground">YouTube</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">FB</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Facebook</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">IG</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Instagram</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleDownload}
                        disabled={isDownloading || !videoUrl.trim()}
                        className="w-full btn-gradient text-primary-foreground py-6 text-lg font-semibold hover:scale-[1.02] transition-all"
                        data-testid="download-button"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {isDownloading ? "Processing..." : "Download MP4"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Ads and Features */}
            <div className="lg:col-span-1 space-y-6">
              {/* AdSense Sidebar */}
              <AdSidebar />

              {/* Features List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "100% Free", desc: "No registration required" },
                    { title: "High Quality", desc: "Download in MP4 format" },
                    { title: "Fast Downloads", desc: "Direct download links" },
                    { title: "Safe & Secure", desc: "No malware or ads" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { value: "100,000+", label: "Videos Downloaded" },
                    { value: "25,000+", label: "Happy Users" },
                    { value: "MP4", label: "Output Format" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Download Videos from Popular Platforms
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Easily download videos from YouTube, Facebook, and Instagram in MP4 format
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "YouTube Downloads",
                desc: "Download videos from YouTube in high quality MP4 format. Supports all video resolutions.",
                features: ["HD/4K quality", "Fast downloads", "Direct MP4 format"],
                color: "red",
              },
              {
                title: "Facebook Videos", 
                desc: "Download videos from Facebook posts and pages. Get your favorite videos offline.",
                features: ["Public videos", "Page content", "Story downloads"],
                color: "blue",
              },
              {
                title: "Instagram Content",
                desc: "Download Instagram videos, reels, and IGTV content in original quality.",
                features: ["Reels & IGTV", "Stories & posts", "Original quality"],
                color: "pink",
              },
              {
                title: "High Quality",
                desc: "All downloads maintain original video quality and are provided in MP4 format.",
                features: ["Original resolution", "MP4 format", "No quality loss"],
                color: "green",
              },
              {
                title: "Fast & Free",
                desc: "Quick download processing with no registration required. Completely free to use.",
                features: ["No registration", "Unlimited downloads", "Fast processing"],
                color: "purple",
              },
              {
                title: "Safe & Secure",
                desc: "No malware, no viruses, no data collection. Your privacy is our priority.",
                features: ["No malware", "Privacy focused", "Secure downloads"],
                color: "yellow",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}-500/10 rounded-lg flex items-center justify-center mb-4`}>
                    <div className={`w-6 h-6 text-${feature.color}-500`}>
                      <CheckCircle />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.desc}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {feature.features.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
