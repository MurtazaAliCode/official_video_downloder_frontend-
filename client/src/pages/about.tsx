import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import teamPhoto from "@/assets/teams_photo.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About VidDonloader
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're dedicated to providing free, secure, and easy-to-use video processing tools for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src={teamPhoto}  // Fixed: Removed "/assets/"
                alt="VidDonloader Team working collaboratively"
                className="w-full h-auto rounded-xl shadow-lg object-cover"
                style={{ maxHeight: '400px' }}

              />
            </div>

            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
              <p className="text-muted-foreground">
                VidDonloader is a free online video processing tool built with React and Express for speed and privacy.
                We believe everyone should have access to professional video editing capabilities without
                the need for expensive software or complex installations.
              </p>
              <p className="text-muted-foreground">
                Our platform focuses exclusively on processing your own content - no external downloads,
                no copyright violations, just pure video editing power at your fingertips.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "100% Free & Open",
                    desc: "No hidden fees, no registration required"
                  },
                  {
                    title: "Privacy First",
                    desc: "Your files are automatically deleted after 24 hours"
                  },
                  {
                    title: "Legal & Compliant",
                    desc: "DMCA compliant, personal use only"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Video Compression",
                  desc: "Reduce file sizes while maintaining quality for easy sharing and storage.",
                  icon: "Video"
                },
                {
                  title: "Format Conversion",
                  desc: "Convert between MP4, AVI, MOV and create GIFs from video clips.",
                  icon: "Convert"
                },
                {
                  title: "Video Trimming",
                  desc: "Cut and trim videos with precision to remove unwanted sections.",
                  icon: "Trim"
                },
                {
                  title: "Audio Extraction",
                  desc: "Extract high-quality audio tracks in MP3 or WAV format.",
                  icon: "Audio"
                },
                {
                  title: "Watermarking",
                  desc: "Add text or logo watermarks to protect your content.",
                  icon: "Watermark"
                },
                {
                  title: "Privacy Protection",
                  desc: "Secure processing with automatic file deletion after 24 hours.",
                  icon: "Privacy"
                }
              ].map((feature, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-12">Trusted by Thousands</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { value: "50,000+", label: "Videos Processed" },
                { value: "15,000+", label: "Happy Users" },
                { value: "500MB", label: "Max File Size" },
                { value: "24 Hours", label: "File Retention" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}