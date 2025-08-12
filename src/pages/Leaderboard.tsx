import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Leaderboard = () => {
  const entries = [
    { name: "Aisha", xp: 4200, streak: 21 },
    { name: "Marco", xp: 3650, streak: 18 },
    { name: "Nina", xp: 3100, streak: 15 },
  ];

  return (
    <main className="container py-10">
      <SEO title="Leaderboard — SpeakConnect" description="Top learners by XP and streaks. Keep your streak alive and climb the ranks!" canonical="/leaderboard" />
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((e, i) => (
          <Card key={i} className="backdrop-card">
            <CardHeader>
              <CardTitle>#{i + 1} {e.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">XP: {e.xp} • Streak: {e.streak} days</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Leaderboard;