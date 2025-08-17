import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Target, AlertCircle, Calendar, Trophy, BookOpen, Mic, MessageCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MistakeData {
  id: string;
  type: "vocabulary" | "grammar" | "pronunciation" | "listening";
  word: string;
  mistake: string;
  correction: string;
  date: string;
  frequency: number;
}

interface ProgressData {
  vocabulary: { learned: number; total: number; weeklyGrowth: number };
  grammar: { accuracy: number; questionsAnswered: number; improvement: number };
  pronunciation: { score: number; wordsRecorded: number; improvement: number };
  listening: { comprehension: number; exercisesCompleted: number; improvement: number };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  date: string;
  rarity: "common" | "rare" | "legendary";
}

const sampleMistakes: MistakeData[] = [
  {
    id: "1",
    type: "pronunciation",
    word: "Pronunciation",
    mistake: "pro-NOUN-ciation",
    correction: "pro-NUN-ciation", 
    date: "2024-01-15",
    frequency: 5
  },
  {
    id: "2",
    type: "grammar",
    word: "Present Perfect",
    mistake: "I have went",
    correction: "I have gone",
    date: "2024-01-14",
    frequency: 3
  },
  {
    id: "3", 
    type: "vocabulary",
    word: "Entrepreneurship",
    mistake: "Often confused meaning",
    correction: "Business ownership and innovation",
    date: "2024-01-13",
    frequency: 2
  },
  {
    id: "4",
    type: "listening",
    word: "Airport Announcement",
    mistake: "Missed gate number",
    correction: "Listen for numbers carefully",
    date: "2024-01-12",
    frequency: 1
  }
];

const sampleProgress: ProgressData = {
  vocabulary: { learned: 247, total: 500, weeklyGrowth: 15 },
  grammar: { accuracy: 78, questionsAnswered: 134, improvement: 12 },
  pronunciation: { score: 82, wordsRecorded: 89, improvement: 8 },
  listening: { comprehension: 75, exercisesCompleted: 23, improvement: 18 }
};

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Completed your first learning session",
    icon: <Star className="w-6 h-6" />,
    date: "2024-01-10",
    rarity: "common"
  },
  {
    id: "2",
    title: "Pronunciation Pro",
    description: "Achieved 80% pronunciation accuracy",
    icon: <Mic className="w-6 h-6" />,
    date: "2024-01-14",
    rarity: "rare"
  },
  {
    id: "3",
    title: "Grammar Guardian",
    description: "Answered 100 grammar questions correctly",
    icon: <BookOpen className="w-6 h-6" />,
    date: "2024-01-15",
    rarity: "legendary"
  }
];

interface ReviewSessionProps {
  onBack: () => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [weeklyStreak, setWeeklyStreak] = useState(5);
  const [totalXP, setTotalXP] = useState(1250);

  const getMistakesByType = (type: MistakeData["type"]) => {
    return sampleMistakes.filter(mistake => mistake.type === type);
  };

  const getTypeIcon = (type: MistakeData["type"]) => {
    switch (type) {
      case "vocabulary": return <BookOpen className="w-4 h-4" />;
      case "grammar": return <Target className="w-4 h-4" />;
      case "pronunciation": return <Mic className="w-4 h-4" />;
      case "listening": return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100 dark:bg-green-950";
    if (percentage >= 60) return "text-blue-600 bg-blue-100 dark:bg-blue-950";
    return "text-orange-600 bg-orange-100 dark:bg-orange-950";
  };

  return (
    <main className="container max-w-6xl py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Progress Review & Feedback
        </h1>
        <p className="text-muted-foreground text-lg">Track your learning journey and improve weak areas</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="backdrop-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalXP}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        <Card className="backdrop-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{weeklyStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        <Card className="backdrop-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary-foreground">{sampleProgress.vocabulary.learned}</div>
            <div className="text-sm text-muted-foreground">Words Learned</div>
          </CardContent>
        </Card>
        <Card className="backdrop-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <Card className="backdrop-card shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  This Week's Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vocabulary</span>
                    <Badge variant="secondary">+{sampleProgress.vocabulary.weeklyGrowth} words</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Grammar Accuracy</span>
                    <Badge variant={sampleProgress.grammar.improvement > 0 ? "default" : "destructive"}>
                      {sampleProgress.grammar.improvement > 0 ? "+" : ""}{sampleProgress.grammar.improvement}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pronunciation Score</span>
                    <Badge variant={sampleProgress.pronunciation.improvement > 0 ? "default" : "destructive"}>
                      {sampleProgress.pronunciation.improvement > 0 ? "+" : ""}{sampleProgress.pronunciation.improvement}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Listening Comprehension</span>
                    <Badge variant={sampleProgress.listening.improvement > 0 ? "default" : "destructive"}>
                      {sampleProgress.listening.improvement > 0 ? "+" : ""}{sampleProgress.listening.improvement}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Areas to Focus */}
            <Card className="backdrop-card shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-destructive" />
                  Areas to Focus On
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {sampleMistakes.slice(0, 4).map((mistake) => (
                    <div key={mistake.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      {getTypeIcon(mistake.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{mistake.word}</p>
                        <p className="text-xs text-muted-foreground">{mistake.type}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {mistake.frequency}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Suggestions */}
          <Card className="backdrop-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Personalized Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Pronunciation Focus</h4>
                <p className="text-sm text-muted-foreground">Practice words ending in '-tion' sounds</p>
                <Button size="sm" className="mt-3">Practice Now</Button>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <h4 className="font-semibold text-accent mb-2">Grammar Drill</h4>
                <p className="text-sm text-muted-foreground">Review present perfect vs. past simple</p>
                <Button size="sm" variant="outline" className="mt-3">Study Grammar</Button>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-semibold text-secondary-foreground mb-2">Vocabulary Expansion</h4>
                <p className="text-sm text-muted-foreground">Learn business-related terms</p>
                <Button size="sm" variant="secondary" className="mt-3">Add Words</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes" className="space-y-6">
          <Card className="backdrop-card shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Common Mistakes & Corrections
              </CardTitle>
              <CardDescription>Review your most frequent mistakes to avoid repeating them</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleMistakes.map((mistake) => (
                  <Card key={mistake.id} className="border-l-4 border-l-destructive">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(mistake.type)}
                            <Badge variant="outline" className="capitalize">{mistake.type}</Badge>
                            <Badge variant="destructive">{mistake.frequency} times</Badge>
                          </div>
                          <h4 className="font-semibold">{mistake.word}</h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Your mistake:</p>
                              <p className="text-destructive font-medium">{mistake.mistake}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Correct form:</p>
                              <p className="text-green-600 font-medium">{mistake.correction}</p>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Practice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(sampleProgress).map(([skill, data]) => (
              <Card key={skill} className="backdrop-card shadow-glow">
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {getTypeIcon(skill as MistakeData["type"])}
                    {skill}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skill === "vocabulary" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Words Learned</span>
                          <span className="font-medium">{data.learned}/{data.total}</span>
                        </div>
                        <Progress value={(data.learned / data.total) * 100} className="h-2" />
                      </div>
                      <div className={cn("p-3 rounded-lg", getProgressColor(data.weeklyGrowth))}>
                        <p className="text-sm font-medium">+{data.weeklyGrowth} words this week</p>
                      </div>
                    </>
                  )}
                  
                  {skill === "grammar" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Accuracy</span>
                          <span className="font-medium">{data.accuracy}%</span>
                        </div>
                        <Progress value={data.accuracy} className="h-2" />
                      </div>
                      <div className={cn("p-3 rounded-lg", getProgressColor(data.improvement))}>
                        <p className="text-sm font-medium">
                          {data.improvement > 0 ? "+" : ""}{data.improvement}% improvement
                        </p>
                      </div>
                    </>
                  )}
                  
                  {skill === "pronunciation" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Average Score</span>
                          <span className="font-medium">{data.score}%</span>
                        </div>
                        <Progress value={data.score} className="h-2" />
                      </div>
                      <div className={cn("p-3 rounded-lg", getProgressColor(data.improvement))}>
                        <p className="text-sm font-medium">
                          {data.improvement > 0 ? "+" : ""}{data.improvement}% improvement
                        </p>
                      </div>
                    </>
                  )}
                  
                  {skill === "listening" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Comprehension</span>
                          <span className="font-medium">{data.comprehension}%</span>
                        </div>
                        <Progress value={data.comprehension} className="h-2" />
                      </div>
                      <div className={cn("p-3 rounded-lg", getProgressColor(data.improvement))}>
                        <p className="text-sm font-medium">
                          {data.improvement > 0 ? "+" : ""}{data.improvement}% improvement
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="backdrop-card shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Your Achievements
              </CardTitle>
              <CardDescription>Celebrate your learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={cn(
                      "text-center border-2",
                      achievement.rarity === "legendary" && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
                      achievement.rarity === "rare" && "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
                      achievement.rarity === "common" && "border-gray-300"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
                        achievement.rarity === "legendary" && "bg-yellow-500 text-white",
                        achievement.rarity === "rare" && "bg-purple-500 text-white", 
                        achievement.rarity === "common" && "bg-gray-500 text-white"
                      )}>
                        {achievement.icon}
                      </div>
                      <h4 className="font-semibold mb-1">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <Badge 
                        variant={achievement.rarity === "legendary" ? "default" : "outline"}
                        className={cn(
                          achievement.rarity === "legendary" && "bg-yellow-500 text-white",
                          achievement.rarity === "rare" && "bg-purple-500 text-white"
                        )}
                      >
                        {achievement.rarity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned: {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ReviewSession;