import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const categoryFilters = ["All", "Artist", "Educator", "Coach", "Designer", "Tradesperson", "Consultant", "Creator", "Photographer", "Musician", "Developer"];

const Discover = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  document.title = "Discover Talent — Less";
  const { user } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data ?? [];
    },
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["discover-profiles", activeCategory, search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*, categories(name)")
        .eq("is_published", true)
        .not("username", "is", null);

      if (activeCategory !== "All") {
        const cat = categories?.find(c => c.name === activeCategory);
        if (cat) query = query.eq("category_id", cat.id);
      }

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%`);
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(40);
      return data ?? [];
    },
    enabled: !!categories,
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Less" className="h-10 w-10 rounded-lg object-cover" />
          <span className="text-xl font-semibold text-foreground">Less</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild>
              <Link to="/profile/edit">My Profile</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              <Button asChild><Link to="/signup">Sign up</Link></Button>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Discover talent</h1>
          <p className="text-muted-foreground mt-2">Browse real work from real people. No fluff, no filters.</p>
        </div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or skill..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categoryFilters.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles && profiles.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map(profile => (
              <Link
                key={profile.id}
                to={`/profile/${profile.username ?? profile.id}`}
                className="group block rounded-2xl border border-border bg-card p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-xl font-bold mb-4 group-hover:scale-105 transition-transform">
                  {(profile.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-foreground">{profile.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{profile.title}</p>
                {(profile as any).categories?.name && (
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {(profile as any).categories.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No creators yet</p>
            <p className="text-sm mt-1">Be the first to join!</p>
            <Button asChild className="mt-6"><Link to="/signup">Create your profile</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
