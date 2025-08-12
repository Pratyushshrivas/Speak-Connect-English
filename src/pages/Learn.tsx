import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Headphones, Mic, MessageSquare, Sparkles, History } from "lucide-react";

const Learn = () => {
  return (
    <main className="container py-10">
      <SEO title="English Learning Sessions — SpeakConnect" description="Daily English lessons: vocabulary, grammar, pronunciation, and listening drills with XP and streaks." canonical="/learn" />
      <h1 className="text-3xl font-bold mb-4">English Learning Sessions</h1>
      <p className="text-muted-foreground mb-8">Short, interactive sessions designed to build real communication skills.</p>

      {/* Highlight banner */}
      <section aria-labelledby="learn-intro" className="mb-10">
        <div className="rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 id="learn-intro" className="text-xl md:text-2xl font-semibold">Level up with bite‑size, beautiful lessons</h2>
              <p className="opacity-90 mt-1">Earn XP, keep your streak, and master real‑world communication.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 text-primary-foreground px-4 py-2 text-sm">
                <Sparkles /> Daily target: +20 XP
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 text-primary-foreground px-4 py-2 text-sm">
                <History /> Keep your streak
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions grid */}
      <section aria-labelledby="sessions" className="relative">
        <h2 id="sessions" className="sr-only">Learning Sessions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group backdrop-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary transition-transform group-hover:scale-110">
                  <Book />
                </span>
                Vocabulary Builder
              </CardTitle>
              <CardDescription>Flashcards, matching games, spaced repetition.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="sm" aria-label="Start Vocabulary Builder">Start</Button>
            </CardContent>
          </Card>

          <Card className="group backdrop-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary transition-transform group-hover:scale-110">
                  <Sparkles />
                </span>
                Grammar Practice
              </CardTitle>
              <CardDescription>Fill-in-the-blanks and MCQs with instant feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="sm" aria-label="Start Grammar Practice">Start</Button>
            </CardContent>
          </Card>

          <Card className="group backdrop-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary transition-transform group-hover:scale-110">
                  <Mic />
                </span>
                Pronunciation Practice
              </CardTitle>
              <CardDescription>Repeat-after-audio with AI scoring (soon).</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="sm" aria-label="Start Pronunciation Practice">Start</Button>
            </CardContent>
          </Card>

          <Card className="group backdrop-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary transition-transform group-hover:scale-110">
                  <Headphones />
                </span>
                Listening Mastery
              </CardTitle>
              <CardDescription>Listen & answer, transcribe short clips.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="sm" aria-label="Start Listening Mastery">Start</Button>
            </CardContent>
          </Card>

          <Card className="group backdrop-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary transition-transform group-hover:scale-110">
                  <MessageSquare />
                </span>
                Conversation Drills
              </CardTitle>
              <CardDescription>Role-plays like ordering food, travel talk.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="sm" aria-label="Start Conversation Drills">Start</Button>
            </CardContent>
          </Card>

          <Card className="group backdrop-card transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary transition-transform group-hover:scale-110">
                  <History />
                </span>
                Review & Feedback
              </CardTitle>
              <CardDescription>Mistakes recap, suggested practice.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="sm" aria-label="Start Review & Feedback">Start</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};


export default Learn;