import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, RefreshCcw, CheckCircle, XCircle, Shuffle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  difficulty: "easy" | "medium" | "hard";
  audio?: string;
}

const sampleWords: VocabularyWord[] = [
  {
    id: "1",
    word: "Serendipity",
    meaning: "A pleasant surprise or fortunate accident",
    example: "Finding my lost ring was pure serendipity.",
    difficulty: "hard"
  },
  {
    id: "2", 
    word: "Eloquent",
    meaning: "Fluent and persuasive in speaking or writing",
    example: "Her eloquent speech moved the entire audience.",
    difficulty: "medium"
  },
  {
    id: "3",
    word: "Resilient",
    meaning: "Able to recover quickly from difficulties",
    example: "The resilient community rebuilt after the flood.",
    difficulty: "medium"
  },
  {
    id: "4",
    word: "Ubiquitous",
    meaning: "Present, appearing, or found everywhere",
    example: "Smartphones are now ubiquitous in modern society.",
    difficulty: "hard"
  }
];

const matchingPairs = [
  { word: "Ambitious", meaning: "Having a strong desire for success" },
  { word: "Diligent", meaning: "Showing care and effort in work" },
  { word: "Innovative", meaning: "Introducing new ideas or methods" },
  { word: "Compassionate", meaning: "Showing sympathy and concern for others" }
];

interface VocabularySessionProps {
  onBack: () => void;
}

const VocabularySession: React.FC<VocabularySessionProps> = ({ onBack }) => {
  const [mode, setMode] = useState<"select" | "flashcards" | "matching" | "spaced">("select");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [selectedMatches, setSelectedMatches] = useState<{word?: string, meaning?: string}>({});
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [matchingScore, setMatchingScore] = useState(0);

  const currentWord = sampleWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / sampleWords.length) * 100;

  const playAudio = useCallback(() => {
    // Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, [currentWord.word]);

  const handleKnowIt = () => {
    setScore(prev => prev + 10);
    setWordsLearned(prev => prev + 1);
    nextWord();
  };

  const handleDontKnowIt = () => {
    setScore(prev => prev + 5);
    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < sampleWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      alert(`Session complete! Score: ${score} | Words learned: ${wordsLearned}`);
    }
  };

  const handleMatchSelect = (item: string, type: 'word' | 'meaning') => {
    if (type === 'word') {
      if (selectedMatches.meaning) {
        // Check if match is correct
        const pair = matchingPairs.find(p => p.word === item && p.meaning === selectedMatches.meaning);
        if (pair) {
          setMatchedPairs(prev => [...prev, item, selectedMatches.meaning!]);
          setMatchingScore(prev => prev + 10);
        }
        setSelectedMatches({});
      } else {
        setSelectedMatches({word: item});
      }
    } else {
      if (selectedMatches.word) {
        // Check if match is correct
        const pair = matchingPairs.find(p => p.word === selectedMatches.word && p.meaning === item);
        if (pair) {
          setMatchedPairs(prev => [...prev, selectedMatches.word!, item]);
          setMatchingScore(prev => prev + 10);
        }
        setSelectedMatches({});
      } else {
        setSelectedMatches({meaning: item});
      }
    }
  };

  if (mode === "select") {
    return (
      <main className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Vocabulary Builder
          </h1>
          <p className="text-muted-foreground text-lg">Choose your learning mode</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => setMode("flashcards")}>
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Flashcards</CardTitle>
              <CardDescription>Learn new words with interactive cards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Flashcards</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => setMode("matching")}>
            <CardHeader className="text-center">
              <Shuffle className="w-12 h-12 text-accent mx-auto mb-2" />
              <CardTitle>Matching Game</CardTitle>
              <CardDescription>Match words to their meanings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Start Matching</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => setMode("spaced")}>
            <CardHeader className="text-center">
              <RefreshCcw className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Spaced Repetition</CardTitle>
              <CardDescription>Review words you need to practice</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">Review Words</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (mode === "flashcards") {
    return (
      <main className="container max-w-2xl py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setMode("select")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Score: {score}</Badge>
            <Badge variant="secondary">Learned: {wordsLearned}</Badge>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{currentWordIndex + 1}/{sampleWords.length}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="backdrop-card shadow-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant={currentWord.difficulty === "easy" ? "secondary" : currentWord.difficulty === "medium" ? "default" : "destructive"}>
                {currentWord.difficulty}
              </Badge>
              <Button variant="ghost" size="sm" onClick={playAudio}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="text-4xl font-bold text-primary mb-4">{currentWord.word}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {!showAnswer ? (
              <Button onClick={() => setShowAnswer(true)} className="bg-gradient-primary">
                Show Meaning
              </Button>
            ) : (
              <>
                <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
                  <p className="text-lg font-semibold">{currentWord.meaning}</p>
                  <p className="text-muted-foreground italic">"{currentWord.example}"</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleKnowIt} className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Know it!
                  </Button>
                  <Button onClick={handleDontKnowIt} variant="destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Need practice
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (mode === "matching") {
    return (
      <main className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setMode("select")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Badge variant="outline">Score: {matchingScore}</Badge>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Match the Words</h2>
          <p className="text-muted-foreground">Click a word, then click its meaning</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Words</h3>
            {matchingPairs.map((pair) => (
              <Card
                key={pair.word}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg",
                  matchedPairs.includes(pair.word) && "opacity-50 cursor-not-allowed",
                  selectedMatches.word === pair.word && "ring-2 ring-primary"
                )}
                onClick={() => !matchedPairs.includes(pair.word) && handleMatchSelect(pair.word, 'word')}
              >
                <CardContent className="p-4 text-center">
                  <span className="font-semibold text-lg">{pair.word}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Meanings</h3>
            {matchingPairs.map((pair) => (
              <Card
                key={pair.meaning}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg",
                  matchedPairs.includes(pair.meaning) && "opacity-50 cursor-not-allowed",
                  selectedMatches.meaning === pair.meaning && "ring-2 ring-accent"
                )}
                onClick={() => !matchedPairs.includes(pair.meaning) && handleMatchSelect(pair.meaning, 'meaning')}
              >
                <CardContent className="p-4 text-center">
                  <span className="text-sm">{pair.meaning}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {matchedPairs.length === matchingPairs.length * 2 && (
          <div className="text-center mt-8">
            <Card className="inline-block bg-gradient-primary">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Congratulations! 🎉</h3>
                <p className="text-white/90">You matched all words correctly!</p>
                <p className="text-white/90">Final Score: {matchingScore}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    );
  }

  return null;
};

export default VocabularySession;