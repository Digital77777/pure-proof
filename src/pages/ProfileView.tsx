import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import BookingDialog from "@/components/BookingDialog";

const ProfileView = () => {
  const { username } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, categories(name)")
        .eq("username", username!)
        .single();
      return data;
    },
    enabled: !!username,
  });

  const { data: mediaItems } = useQuery({
    queryKey: ["public-media", profile?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("media_items")
        .select("*")
        .eq("user_id", profile!.user_id)
        .order("display_order");
      return data ?? [];
    },
    enabled: !!profile?.user_id,
  });

  const images = mediaItems?.filter(m => m.type === "image") ?? [];
  const videos = mediaItems?.filter(m => m.type === "video") ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Profile not found</p>
        <Button asChild><Link to="/discover">Browse creators</Link></Button>
      </div>
    );
  }

  const categoryName = (profile as any).categories?.name;

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Button variant="ghost" asChild>
          <Link to="/discover"><ArrowLeft className="h-4 w-4 mr-2" /> Discover</Link>
        </Button>
        <Link to="/">
          <img src="/logo.jpg" alt="Less" className="h-8 w-8 rounded-lg object-cover" />
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-4">
            {(profile.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
          {profile.title && <p className="text-lg text-primary font-medium mt-1">{profile.title}</p>}
          {profile.location && (
            <p className="flex items-center justify-center gap-1 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" /> {profile.location}
            </p>
          )}
          {profile.bio && <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{profile.bio}</p>}
          {categoryName && (
            <span className="inline-block mt-4 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              {categoryName}
            </span>
          )}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            {profile.contact_link && (
              <Button variant="outline" asChild>
                <a href={profile.contact_link} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" /> Website
                </a>
              </Button>
            )}
            <BookingDialog
              creatorId={profile.user_id}
              creatorName={profile.name ?? "Creator"}
              type="session"
              trigger={<Button>Book Session</Button>}
            />
            <BookingDialog
              creatorId={profile.user_id}
              creatorName={profile.name ?? "Creator"}
              type="commission"
              trigger={<Button variant="secondary">Commission Work</Button>}
            />
          </div>
        </div>

        {images.length === 0 && videos.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No content yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {images.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((item) => (
                    <div key={item.id} className="aspect-square rounded-xl overflow-hidden">
                      <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {videos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Videos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {videos.map((item) => (
                    <div key={item.id} className="aspect-square rounded-xl overflow-hidden">
                      <video src={item.url} controls className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
