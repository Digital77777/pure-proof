import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, ArrowLeft, Globe } from "lucide-react";

const ProfileView = () => {
  const { username } = useParams();

  // Placeholder data — will be fetched from Supabase
  const profile = {
    name: username || "Creator",
    title: "Visual Artist",
    bio: "Creating beauty through lens and brush. Based in Barcelona, working globally.",
    location: "Barcelona, Spain",
    contactLink: "https://example.com",
    category: "Artist",
    images: [] as string[],
    videos: [] as string[],
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Button variant="ghost" asChild>
          <Link to="/discover"><ArrowLeft className="h-4 w-4 mr-2" /> Discover</Link>
        </Button>
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Less" className="h-8 w-8 rounded-lg object-cover" />
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Profile header */}
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-4">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
          <p className="text-lg text-primary font-medium mt-1">{profile.title}</p>
          {profile.location && (
            <p className="flex items-center justify-center gap-1 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" /> {profile.location}
            </p>
          )}
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{profile.bio}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              {profile.category}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            {profile.contactLink && (
              <Button variant="outline" asChild>
                <a href={profile.contactLink} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" /> Website
                </a>
              </Button>
            )}
            <Button>Book Session</Button>
            <Button variant="secondary">Commission Work</Button>
          </div>
        </div>

        {/* Media grid */}
        {profile.images.length === 0 && profile.videos.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No content yet</p>
            <p className="text-sm mt-1">This creator hasn't uploaded any work.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {profile.images.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {profile.images.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {profile.videos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Videos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {profile.videos.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <video src={url} controls className="w-full h-full object-cover" />
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
