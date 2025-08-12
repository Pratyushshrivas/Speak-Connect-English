import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PhoneCall, ShieldCheck, Timer } from "lucide-react";

const Speak = () => {
  return (
    <main className="container py-10">
      <SEO title="Practice Speaking — Random Voice Calls | SpeakConnect" description="Find a random partner by level and practice English speaking with prompts and safety features." canonical="/speak" />
      <h1 className="text-3xl font-bold mb-6">Practice Speaking — Random Voice Calls</h1>
      <p className="text-muted-foreground mb-8">Match with another learner, choose a topic, and talk for 3–10 minutes. Get post‑call feedback.</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PhoneCall className="text-primary" /> Find a Partner</CardTitle>
          <CardDescription>Level‑based matchmaking with guided prompts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="hero">Find Partner</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Coming next: Realtime calls with WebRTC</DialogTitle>
                  <DialogDescription>
                    We'll set up secure voice calls using WebRTC + STUN/TURN and Supabase for auth, presence, and matchmaking. You'll click Find Partner, we match by level, then start a call with prompts and a timer.
                  </DialogDescription>
                </DialogHeader>
                <ul className="list-disc pl-5 text-sm space-y-2 text-muted-foreground">
                  <li>Auth via email/social login (Supabase Auth)</li>
                  <li>Realtime presence & matchmaking (Supabase Realtime)</li>
                  <li>Peer connection (WebRTC) with TURN for reliability</li>
                  <li>Post‑call feedback and XP update</li>
                </ul>
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" /> Timed sessions
              <ShieldCheck className="h-4 w-4" /> Safety tools
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Speak;