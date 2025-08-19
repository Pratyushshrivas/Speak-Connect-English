import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const entries = [
    { name: "Aisha", xp: 4200, streak: 21 },
    { name: "Marco", xp: 3650, streak: 18 },
    { name: "Nina", xp: 3100, streak: 15 },
  ];

  return (
    <main className="container py-10">
      <SEO title="Leaderboard — SpeakConnect" description="Top learners by XP and streaks. Keep your streak alive and climb the ranks!" canonical="/leaderboard" />
      
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBackToHome}
          className="hover:bg-secondary/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top learners by XP and streaks. Keep your streak alive!</p>
        </div>
      </div>
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