import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share, Plus, MoreVertical } from "lucide-react";

const Install = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Button variant="ghost" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Home</Link>
        </Button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="text-center py-10">
          <img src="/logo.jpg" alt="Less" className="h-20 w-20 rounded-2xl object-cover mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground">Install Less</h1>
          <p className="text-muted-foreground mt-2">Add Less to your home screen for the best experience</p>
        </div>

        <div className="space-y-6">
          {/* iOS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">iPhone & iPad (Safari)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">1</div>
                <p className="text-muted-foreground">Tap the <Share className="inline h-4 w-4 text-primary" /> Share button in Safari's toolbar</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">2</div>
                <p className="text-muted-foreground">Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">3</div>
                <p className="text-muted-foreground">Tap <strong className="text-foreground">"Add"</strong> — Less will appear on your home screen</p>
              </div>
            </CardContent>
          </Card>

          {/* Android */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Android (Chrome)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">1</div>
                <p className="text-muted-foreground">Tap the <MoreVertical className="inline h-4 w-4 text-primary" /> menu button in Chrome</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">2</div>
                <p className="text-muted-foreground">Tap <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">3</div>
                <p className="text-muted-foreground">Confirm — Less will install as an app on your device</p>
              </div>
            </CardContent>
          </Card>

          {/* Desktop */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Desktop (Chrome / Edge)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">1</div>
                <p className="text-muted-foreground">Click the <Download className="inline h-4 w-4 text-primary" /> install icon in the address bar</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">2</div>
                <p className="text-muted-foreground">Click <strong className="text-foreground">"Install"</strong> to add Less as a desktop app</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Install;
