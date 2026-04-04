import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Image, Video, Globe, Sparkles, Eye, HandshakeIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Less" className="h-10 w-10 rounded-lg object-cover" />
          <span className="text-xl font-semibold text-foreground">Less</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
          Less noise.<br />More proof.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your visual CV for the real world. Show only what matters: your talent, your skill, your work.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="text-base px-8">
            <Link to="/signup">
              Get started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base px-8">
            <Link to="/discover">Browse creators</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-secondary/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Build your profile",
                desc: "Upload your best 5 videos and 5 images. That's it — nothing more, nothing less."
              },
              {
                icon: <Eye className="h-8 w-8" />,
                title: "Showcase your work",
                desc: "Your art, services, courses, or expertise — presented cleanly, without noise."
              },
              {
                icon: <HandshakeIcon className="h-8 w-8" />,
                title: "Exchange value",
                desc: "Book sessions, buy products, commission work, or hire talent. Only 5% fee."
              }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The limit */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="flex items-center gap-2 text-primary">
              <Video className="h-6 w-6" />
              <span className="text-2xl font-bold">5</span>
              <span className="text-muted-foreground">videos</span>
            </div>
            <span className="text-3xl text-muted-foreground/30">+</span>
            <div className="flex items-center gap-2 text-primary">
              <Image className="h-6 w-6" />
              <span className="text-2xl font-bold">5</span>
              <span className="text-muted-foreground">images</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Your strongest visual proof
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No feeds. No stories. No likes chasing. Just your best work and people who actually value it. One profile. Global reach. Instant credibility.
          </p>
        </div>
      </section>

      {/* Why Less exists */}
      <section className="px-6 py-20 bg-secondary/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
            Why Less exists
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>Because the world already has too much content. What it needs is more clarity.</p>
            <p>Less strips away the noise so your skills can stand out.</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left">
            {[
              { bold: "Less stuff.", light: "More substance." },
              { bold: "Less scrolling.", light: "More doing." },
              { bold: "Less followers.", light: "More opportunities." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border">
                <p className="font-semibold text-foreground">{item.bold}</p>
                <p className="text-muted-foreground mt-1">{item.light}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
            For every kind of talent
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Artist", "Educator", "Coach", "Designer", "Tradesperson", "Consultant", "Creator", "Photographer", "Musician", "Developer"].map(cat => (
              <span key={cat} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Turn your talent into your full-time reality
          </h2>
          <p className="text-lg opacity-90 mb-10">
            No algorithms deciding who sees you. No pressure to post daily. Just you, your best work, and people who actually value it.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base px-8">
            <Link to="/signup">
              Get started for free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Less" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-semibold text-foreground">Less</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/discover" className="hover:text-foreground transition-colors">Discover</Link>
            <Link to="/install" className="hover:text-foreground transition-colors">Install App</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Less. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
