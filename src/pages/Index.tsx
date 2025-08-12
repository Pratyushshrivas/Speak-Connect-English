import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-conversation.jpg";
import { Link } from "react-router-dom";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SpeakConnect English",
    applicationCategory: "EducationApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Gamified English communication practice with lessons, pronunciation drills, and random voice calls with peers.",
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="SpeakConnect English — Gamified Speaking Practice"
        description="Improve your English speaking with bite‑size lessons, pronunciation feedback, listening drills, and random voice calls with peers."
        canonical="/"
      />

      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-primary blur-3xl opacity-40" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-primary blur-3xl opacity-30" aria-hidden />

        <section className="container grid lg:grid-cols-2 gap-10 py-16 lg:py-24 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              SpeakConnect English — Practice Speaking with Confidence
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Learn through gamified lessons and real conversations. Build
              vocabulary, master pronunciation, and join random voice calls with
              learners worldwide.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/learn">Start Learning</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/speak">Practice Speaking</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Learners practicing English conversation online"
              loading="lazy"
              className="rounded-xl border shadow-glow w-full"
            />
          </div>
        </section>
      </header>

      <main>
        <section id="features" className="container py-12 lg:py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="backdrop-card">
              <CardHeader>
                <CardTitle>Daily Lessons</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Vocabulary, grammar, and listening drills that fit your schedule.
              </CardContent>
            </Card>
            <Card className="backdrop-card">
              <CardHeader>
                <CardTitle>Pronunciation Coach</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Repeat sentences and get instant feedback powered by AI.
              </CardContent>
            </Card>
            <Card className="backdrop-card">
              <CardHeader>
                <CardTitle>Random Voice Calls</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Match with peers by level and speak with guided prompts.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="how-it-works" className="container py-12 lg:py-16">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-semibold mb-2">How it works</h2>
              <p className="text-muted-foreground">
                Learn, practice, and track your progress — designed for real
                communication.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-6">
              <Card><CardContent className="pt-6">1. Take a quick level test</CardContent></Card>
              <Card><CardContent className="pt-6">2. Finish daily lessons</CardContent></Card>
              <Card><CardContent className="pt-6">3. Speak with peers</CardContent></Card>
            </div>
          </div>
        </section>

        <section id="cta" className="container py-12 lg:py-20 text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to speak daily?</h2>
          <p className="text-muted-foreground mb-6">
            Build streaks, earn XP, and improve faster with real conversations.
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/speak">Find a Partner</Link>
          </Button>
        </section>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Index;
