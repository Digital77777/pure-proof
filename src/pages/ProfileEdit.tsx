import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, Plus, X, ArrowLeft, Loader2, LogOut, Camera } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ProfileEdit = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [contactLink, setContactLink] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data ?? [];
    },
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch media
  const { data: mediaItems } = useQuery({
    queryKey: ["media", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("media_items").select("*").eq("user_id", user.id).order("display_order");
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setUsername(profile.username ?? "");
      setTitle(profile.title ?? "");
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
      setContactLink(profile.contact_link ?? "");
      setCategoryId(profile.category_id ?? "");
      setAvatarUrl((profile as any).avatar_url ?? "");
    }
  }, [profile]);

  const images = mediaItems?.filter(m => m.type === "image") ?? [];
  const videos = mediaItems?.filter(m => m.type === "video") ?? [];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        username: username || null,
        title,
        bio,
        location,
        contact_link: contactLink,
        category_id: categoryId || null,
        is_published: true,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile saved!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  const [uploading, setUploading] = useState<string | null>(null);

  const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async (file: File, type: "image" | "video") => {
    if (!user) return;
    const count = type === "image" ? images.length : videos.length;
    if (count >= 5) {
      toast.error(`Maximum 5 ${type}s allowed`);
      return;
    }

    const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      toast.error(`File too large (${formatSize(file.size)}). Max ${type === "image" ? "50 MB" : "500 MB"}.`);
      return;
    }

    setUploading(type);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${type}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);

    const { error: insertError } = await supabase.from("media_items").insert({
      user_id: user.id,
      type,
      url: urlData.publicUrl,
      storage_path: path,
      display_order: count,
    });

    setUploading(null);
    if (insertError) {
      toast.error(insertError.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success(`${type === "image" ? "Image" : "Video"} uploaded in HD!`);
    }
  };

  const handleDelete = async (id: string, storagePath: string | null) => {
    if (storagePath) {
      await supabase.storage.from("media").remove([storagePath]);
    }
    await supabase.from("media_items").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["media"] });
    toast.success("Removed");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Button variant="ghost" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/bookings">Bookings</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
          <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate("/"); }} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-8">
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
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="your-username" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Role</Label>
              <Input id="title" placeholder="e.g. Photographer" value={title} onChange={e => setTitle(e.target.value)} />
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
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      categoryId === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cat.name}
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
              Images ({images.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {images.map(item => (
                <div key={item.id} className="relative aspect-square rounded-xl border border-border overflow-hidden group">
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDelete(item.id, item.storage_path)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                  {uploading === "image" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add image</span>
                      <span className="text-[10px] text-muted-foreground">up to 50 MB</span>
                    </>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/gif" className="hidden" disabled={uploading === "image"} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "image")} />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Videos ({videos.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {videos.map(item => (
                <div key={item.id} className="relative aspect-square rounded-xl border border-border overflow-hidden group">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDelete(item.id, item.storage_path)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {videos.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                  {uploading === "video" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add video</span>
                      <span className="text-[10px] text-muted-foreground">up to 500 MB</span>
                    </>
                  )}
                  <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska" className="hidden" disabled={uploading === "video"} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "video")} />
                </label>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
