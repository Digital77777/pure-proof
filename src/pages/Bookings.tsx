import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  accepted: { label: "Accepted", variant: "default", icon: CheckCircle },
  completed: { label: "Completed", variant: "outline", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const typeLabels: Record<string, string> = {
  session: "Session",
  commission: "Commission",
  product: "Product",
  course: "Course",
};

const Bookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  // Bookings where I'm the creator (received)
  const { data: received, isLoading: loadingReceived } = useQuery({
    queryKey: ["bookings-received", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, client:profiles!bookings_client_id_fkey(name, username)")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  // Bookings where I'm the client (sent)
  const { data: sent, isLoading: loadingSent } = useQuery({
    queryKey: ["bookings-sent", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, creator:profiles!bookings_creator_id_fkey(name, username)")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Booking ${status}`);
      queryClient.invalidateQueries({ queryKey: ["bookings-received"] });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderBookingCard = (booking: any, perspective: "creator" | "client") => {
    const sc = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = sc.icon;
    const otherParty = perspective === "creator" ? booking.client : booking.creator;
    const otherName = otherParty?.name ?? "Unknown";
    const otherUsername = otherParty?.username;

    return (
      <Card key={booking.id}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={sc.variant} className="text-xs">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {sc.label}
                </Badge>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                  {typeLabels[booking.type] ?? booking.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {perspective === "creator" ? "From" : "To"}{" "}
                {otherUsername ? (
                  <Link to={`/profile/${otherUsername}`} className="text-primary hover:underline font-medium">
                    {otherName}
                  </Link>
                ) : (
                  <span className="font-medium">{otherName}</span>
                )}
              </p>
              {booking.description && (
                <p className="text-sm text-foreground mt-2">{booking.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="font-semibold text-foreground">
                  ${(booking.amount_cents / 100).toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  Fee: ${(booking.fee_cents / 100).toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {perspective === "creator" && booking.status === "pending" && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <Button size="sm" onClick={() => updateStatus(booking.id, "accepted")}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "cancelled")}>
                Decline
              </Button>
            </div>
          )}

          {perspective === "creator" && booking.status === "accepted" && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <Button size="sm" onClick={() => updateStatus(booking.id, "completed")}>
                Mark Complete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Button variant="ghost" asChild>
          <Link to="/profile/edit"><ArrowLeft className="h-4 w-4 mr-2" /> Profile</Link>
        </Button>
        <Link to="/">
          <img src="/logo.jpg" alt="Less" className="h-8 w-8 rounded-lg object-cover" />
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h1 className="text-3xl font-bold text-foreground mb-8">Bookings</h1>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="received" className="flex-1">
              Received ({received?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1">
              Sent ({sent?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-6 space-y-4">
            {loadingReceived ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : received && received.length > 0 ? (
              received.map(b => renderBookingCard(b, "creator"))
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No bookings received yet</p>
                <p className="text-sm mt-1">When someone books your services, it will appear here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-6 space-y-4">
            {loadingSent ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : sent && sent.length > 0 ? (
              sent.map(b => renderBookingCard(b, "client"))
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No bookings sent yet</p>
                <p className="text-sm mt-1">Browse creators and book their services.</p>
                <Button asChild className="mt-4">
                  <Link to="/discover">Discover creators</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;
