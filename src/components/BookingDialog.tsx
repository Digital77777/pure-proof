import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingDialogProps {
  creatorId: string;
  creatorName: string;
  type: "session" | "commission" | "product" | "course";
  trigger: React.ReactNode;
}

const typeLabels: Record<string, { title: string; desc: string }> = {
  session: { title: "Book a Session", desc: "Request a session with this creator." },
  commission: { title: "Commission Work", desc: "Request custom work from this creator." },
  product: { title: "Buy Product", desc: "Purchase a digital product." },
  course: { title: "Enroll in Course", desc: "Enroll in a course by this creator." },
};

const BookingDialog = ({ creatorId, creatorName, type, trigger }: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const label = typeLabels[type];
  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const feeCents = Math.round(amountCents * 0.05);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to book");
      navigate("/login");
      return;
    }

    if (user.id === creatorId) {
      toast.error("You can't book yourself");
      return;
    }

    if (amountCents <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      client_id: user.id,
      creator_id: creatorId,
      type,
      description,
      amount_cents: amountCents,
      fee_cents: feeCents,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${label.title} request sent to ${creatorName}!`);
      setOpen(false);
      setDescription("");
      setAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label.title}</DialogTitle>
          <DialogDescription>{label.desc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">What do you need?</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're looking for..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Your offer ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            {amountCents > 0 && (
              <p className="text-xs text-muted-foreground">
                Creator receives ${((amountCents - feeCents) / 100).toFixed(2)} · 
                5% platform fee: ${(feeCents / 100).toFixed(2)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
