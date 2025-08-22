import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { Loader2, Search, X, Clock, Users, Wifi, Signal, Star, Zap, Heart, Gift } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MatchmakingInterfaceProps {
  onCancel: () => void;
  onMatchFound?: () => void;
  matchType?: 'partner' | 'group' | 'topic';
}

interface FloatingItem {
  id: string;
  x: number;
  y: number;
  type: 'balloon' | 'star' | 'coin';
  icon: React.ReactNode;
  color: string;
}

interface TriviaQuestion {
  question: string;
  answers: string[];
  correct: number;
}

const triviaQuestions: TriviaQuestion[] = [
  {
    question: "What's the opposite of 'hot'?",
    answers: ["Cold", "Warm", "Cool", "Freezing"],
    correct: 0
  },
  {
    question: "How do you say 'Hello' in Spanish?",
    answers: ["Bonjour", "Hola", "Ciao", "Guten Tag"],
    correct: 1
  },
  {
    question: "What comes after Wednesday?",
    answers: ["Tuesday", "Thursday", "Friday", "Monday"],
    correct: 1
  },
  {
    question: "What's 5 + 3?",
    answers: ["7", "8", "9", "6"],
    correct: 1
  }
];

const MatchmakingInterface = ({ onCancel, onMatchFound, matchType = 'partner' }: MatchmakingInterfaceProps) => {
  const { callStatus, matchingTimer, cancelMatchmaking } = useVoiceCall();
  const [gameScore, setGameScore] = useState(0);
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [currentTrivia, setCurrentTrivia] = useState<TriviaQuestion | null>(null);
  const [showTrivia, setShowTrivia] = useState(false);
  const [matchResult, setMatchResult] = useState<'searching' | 'found' | 'not-found'>('searching');
  const [gameMode, setGameMode] = useState<'balloons' | 'trivia' | 'catch'>('balloons');

  // Generate floating items for games
  const generateFloatingItem = useCallback(() => {
    const types: Array<{ type: 'balloon' | 'star' | 'coin', icon: React.ReactNode, color: string }> = [
      { type: 'balloon', icon: <div className="w-6 h-6 rounded-full bg-red-400 shadow-lg"></div>, color: 'bg-red-400' },
      { type: 'star', icon: <Star className="w-6 h-6 text-yellow-400" />, color: 'text-yellow-400' },
      { type: 'coin', icon: <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>, color: 'bg-yellow-400' }
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    return {
      id: Date.now().toString() + Math.random(),
      x: Math.random() * 80 + 10, // 10% to 90% of screen width
      y: 100, // Start from bottom
      ...randomType
    };
  }, []);

  // Game mechanics
  useEffect(() => {
    if (matchResult !== 'searching') return;

    const interval = setInterval(() => {
      if (gameMode === 'balloons' || gameMode === 'catch') {
        setFloatingItems(prev => {
          // Remove items that reached the top
          const filtered = prev.filter(item => item.y > -10);
          
          // Add new item occasionally
          if (Math.random() < 0.3 && filtered.length < 5) {
            filtered.push(generateFloatingItem());
          }
          
          // Move items up
          return filtered.map(item => ({
            ...item,
            y: item.y - 2
          }));
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameMode, matchResult, generateFloatingItem]);

  // Trivia game
  useEffect(() => {
    if (gameMode === 'trivia' && !showTrivia && matchResult === 'searching') {
      const triviaInterval = setInterval(() => {
        const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
        setCurrentTrivia(randomQuestion);
        setShowTrivia(true);
        
        setTimeout(() => {
          setShowTrivia(false);
          setCurrentTrivia(null);
        }, 8000); // Show for 8 seconds
      }, 12000); // Every 12 seconds

      return () => clearInterval(triviaInterval);
    }
  }, [gameMode, showTrivia, matchResult]);

  // Simulate match finding
  useEffect(() => {
    if (matchingTimer <= 0 && matchResult === 'searching') {
      // 70% chance of finding a match
      const found = Math.random() < 0.7;
      setMatchResult(found ? 'found' : 'not-found');
      
      if (found && onMatchFound) {
        setTimeout(() => {
          onMatchFound();
        }, 3000);
      }
    }
  }, [matchingTimer, matchResult, onMatchFound]);

  const handleCancel = async () => {
    await cancelMatchmaking();
    onCancel();
  };

  const handleItemClick = (itemId: string) => {
    setFloatingItems(prev => prev.filter(item => item.id !== itemId));
    setGameScore(prev => prev + 10);
    
    // Play sound effect (placeholder)
    // playSound('pop');
  };

  const handleTriviaAnswer = (answerIndex: number) => {
    if (currentTrivia && answerIndex === currentTrivia.correct) {
      setGameScore(prev => prev + 50);
      // playSound('correct');
    } else {
      // playSound('wrong');
    }
    setShowTrivia(false);
    setCurrentTrivia(null);
  };

  const switchGameMode = () => {
    const modes: Array<'balloons' | 'trivia' | 'catch'> = ['balloons', 'trivia', 'catch'];
    const currentIndex = modes.indexOf(gameMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setGameMode(modes[nextIndex]);
    setFloatingItems([]);
  };

  if (callStatus !== 'matching') return null;

  const progress = ((120 - matchingTimer) / 120) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMatchTypeText = () => {
    switch (matchType) {
      case 'group': return 'Finding group call partners (4 people)';
      case 'topic': return 'Finding topic-based conversation partner';
      default: return 'Finding your 1-on-1 conversation partner';
    }
  };

  // Match found screen
  if (matchResult === 'found') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center z-50">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
              <Heart className="h-12 w-12 text-white animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-green-700 dark:text-green-300">Match Found!</h2>
            <p className="text-lg text-green-600 dark:text-green-400">We found your perfect partner!</p>
            <p className="text-sm text-muted-foreground">Connecting you now...</p>
          </div>
          
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // No match found screen
  if (matchResult === 'not-found') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 flex items-center justify-center z-50">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="text-8xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-300">No Match Found</h2>
          <p className="text-orange-600 dark:text-orange-400">We couldn't find a partner this time, but don't give up!</p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setMatchResult('searching');
                setGameScore(0);
                setFloatingItems([]);
                // Restart matching logic here
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              <Search className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main matching screen
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex flex-col z-50 overflow-hidden">
      {/* Header Section */}
      <div className="flex-shrink-0 text-center py-8 px-4">
        {/* Animated Connection Rings */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-110"></div>
          <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping scale-125" style={{animationDelay: '0.5s'}}></div>
          <div className="relative bg-gradient-to-r from-primary to-secondary rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-2xl">
            <Search className="h-10 w-10 text-white animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Searching for the best match...
        </h1>
        <p className="text-lg text-muted-foreground mb-4">{getMatchTypeText()}</p>
        
        {/* Timer */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-2xl font-mono font-bold text-primary">
            Matching time left: {formatTime(matchingTimer)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <Progress value={progress} className="h-4 bg-secondary/20" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0:00</span>
            <span>Finding match...</span>
            <span>2:00</span>
          </div>
        </div>
      </div>

      {/* Game Section */}
      <div className="flex-1 relative overflow-hidden">
        {/* Game Mode Switcher */}
        <div className="absolute top-4 left-4 z-10">
          <Button onClick={switchGameMode} size="sm" variant="outline" className="bg-white/80 backdrop-blur">
            <Zap className="h-4 w-4 mr-2" />
            {gameMode === 'balloons' ? 'Tap Balloons' : 
             gameMode === 'trivia' ? 'Trivia Quiz' : 'Catch Items'}
          </Button>
        </div>

        {/* Score Display */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className="bg-white/80 backdrop-blur text-lg px-4 py-2">
            <Gift className="h-4 w-4 mr-2" />
            Score: {gameScore}
          </Badge>
        </div>

        {/* Floating Items Game */}
        {(gameMode === 'balloons' || gameMode === 'catch') && (
          <div className="absolute inset-0">
            {floatingItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="absolute cursor-pointer transform hover:scale-110 transition-transform"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                {item.icon}
              </div>
            ))}
          </div>
        )}

        {/* Trivia Game */}
        {showTrivia && currentTrivia && gameMode === 'trivia' && (
          <div className="absolute inset-x-4 bottom-32">
            <Card className="bg-white/95 backdrop-blur shadow-2xl border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-center">{currentTrivia.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {currentTrivia.answers.map((answer, index) => (
                    <Button
                      key={index}
                      onClick={() => handleTriviaAnswer(index)}
                      variant="outline"
                      className="h-12 text-sm"
                    >
                      {answer}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Instructions */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-white/80 backdrop-blur border-primary/20">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                {gameMode === 'balloons' && (
                  <p className="text-sm text-muted-foreground">🎈 Tap the floating balloons to pop them and earn points!</p>
                )}
                {gameMode === 'trivia' && (
                  <p className="text-sm text-muted-foreground">🧠 Answer trivia questions correctly to earn bonus points!</p>
                )}
                {gameMode === 'catch' && (
                  <p className="text-sm text-muted-foreground">⭐ Catch the falling stars and coins for points!</p>
                )}
                <p className="text-xs text-muted-foreground">Level matching with learners worldwide...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex-shrink-0 p-4">
        <Button 
          onClick={handleCancel}
          variant="outline"
          className="w-full h-12 text-base font-medium border-destructive/20 text-destructive hover:bg-destructive/5 bg-white/80 backdrop-blur"
        >
          <X className="mr-2 h-5 w-5" />
          Cancel Search
        </Button>
      </div>

      {/* Floating Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default MatchmakingInterface;