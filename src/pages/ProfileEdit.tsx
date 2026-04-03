import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, Plus, X, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface MediaSlot {
  id: string;
  type: "image" | "video";
  url?: string;
  file?: File;
}

const ProfileEdit = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [contactLink, setContactLink] = useState("");
  const [category, setCategory] = useState("");

  const [images, setImages] = useState<MediaSlot[]>(
    Array.from({ length: 5 }, (_, i) => ({ id: `img-${i}`, type: "image" }))
  );
  const [videos, setVideos] = useState<MediaSlot[]>(
    Array.from({ length: 5 }, (_, i) => ({ id: `vid-${i}`, type: "video" }))
  );

  const handleFileSelect = (
    index: number,
    type: "image" | "video",
    file: File
  ) => {
    const url = URL.createObjectURL(file);
    if (type === "image") {
      setImages(prev => prev.map((slot, i) => i === index ? { ...slot, url, file } : slot));
    } else {
      setVideos(prev => prev.map((slot, i) => i === index ? { ...slot, url, file } : slot));
    }
  };

  const handleRemove = (index: number, type: "image" | "video") => {
    if (type === "image") {
      setImages(prev => prev.map((slot, i) => i === index ? { ...slot, url: undefined, file: undefined } : slot));
    } else {
      setVideos(prev => prev.map((slot, i) => i === index ? { ...slot, url: undefined, file: undefined } : slot));
    }
  };

  const handleSave = () => {
    // Will connect to Supabase
  };

  const categories = ["Artist", "Educator", "Coach", "Designer", "Tradesperson", "Consultant", "Creator", "Photographer", "Musician", "Developer"];

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Button variant="ghost" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
        </Button>
        <Button onClick={handleSave}>Save profile</Button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-8">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title / Role</Label>
                <Input id="title" placeholder="e.g. Photographer" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell people about your work..." value={bio} onChange={e => setBio(e.target.value)} rows={3} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City, Country" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact link</Label>
                <Input id="contact" placeholder="https://..." value={contactLink} onChange={e => setContactLink(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Images ({images.filter(s => s.url).length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {images.map((slot, i) => (
                <div key={slot.id} className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden group">
                  {slot.url ? (
                    <>
                      <img src={slot.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemove(i, "image")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted transition-colors">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileSelect(i, "image", e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Videos ({videos.filter(s => s.url).length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {videos.map((slot, i) => (
                <div key={slot.id} className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden group">
                  {slot.url ? (
                    <>
                      <video src={slot.url} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemove(i, "video")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted transition-colors">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileSelect(i, "video", e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
