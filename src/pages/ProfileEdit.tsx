import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, ArrowLeft, Loader2, LogOut, Camera } from "lucide-react";
import DraggableMediaGrid from "@/components/DraggableMediaGrid";
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

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar must be under 5 MB");
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    await supabase.storage.from("avatars").remove([path]);
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (uploadError) {
      toast.error(uploadError.message);
      setUploadingAvatar(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error } = await supabase.from("profiles").update({ avatar_url: newUrl } as any).eq("user_id", user.id);
    setUploadingAvatar(false);
    if (error) {
      toast.error(error.message);
    } else {
      setAvatarUrl(newUrl);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar updated!");
    }
  };

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
        avatar_url: avatarUrl || null,
        is_published: true,
      } as any)
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

  const handleReorder = async (reorderedIds: string[]) => {
    // Optimistically update cache
    queryClient.setQueryData(["media", user?.id], (old: any[] | undefined) => {
      if (!old) return old;
      const map = new Map(old.map(item => [item.id, item]));
      return reorderedIds
        .map((id, i) => {
          const item = map.get(id);
          return item ? { ...item, display_order: i } : null;
        })
        .filter(Boolean)
        .concat(old.filter(item => !reorderedIds.includes(item.id)));
    });

    // Persist new order
    const updates = reorderedIds.map((id, index) =>
      supabase.from("media_items").update({ display_order: index }).eq("id", id)
    );
    await Promise.all(updates);
    queryClient.invalidateQueries({ queryKey: ["media"] });
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
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  {uploadingAvatar ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {(name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                />
              </label>
              <div>
                <p className="text-sm font-medium text-foreground">Profile photo</p>
                <p className="text-xs text-muted-foreground">Click to upload · JPG, PNG, WebP · Max 5 MB</p>
              </div>
            </div>

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
            <DraggableMediaGrid
              items={images}
              type="image"
              maxItems={5}
              maxSizeLabel="up to 50 MB"
              accept="image/jpeg,image/png,image/webp,image/heic,image/gif"
              uploading={uploading === "image"}
              onUpload={(file) => handleUpload(file, "image")}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
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
            <DraggableMediaGrid
              items={videos}
              type="video"
              maxItems={5}
              maxSizeLabel="up to 500 MB"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
              uploading={uploading === "video"}
              onUpload={(file) => handleUpload(file, "video")}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
