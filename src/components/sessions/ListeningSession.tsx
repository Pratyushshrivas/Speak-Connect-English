import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, CheckCircle, XCircle, Headphones, PenTool, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListeningExercise {
  id: string;
  type: "comprehension" | "dictation" | "conversation";
  title: string;
  audio: string;
  text: string;
  question?: string;
  options?: string[];
  correctAnswer: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

const listeningExercises: ListeningExercise[] = [
  {
    id: "1",
    type: "comprehension",
    title: "Airport Announcement",
    audio: "Flight 123 to London is now boarding at gate 15. Please have your boarding passes ready.",
    text: "Flight 123 to London is now boarding at gate 15. Please have your boarding passes ready.",
    question: "Where should passengers go?",
    options: ["Gate 15", "Gate 12", "Gate 51", "Terminal 1"],
    correctAnswer: "Gate 15",
    difficulty: "easy",
    category: "Travel"
  },
  {
    id: "2",
    type: "dictation",
    title: "Weather Report",
    audio: "Tomorrow's weather will be partly cloudy with temperatures reaching 25 degrees Celsius.",
    text: "Tomorrow's weather will be partly cloudy with temperatures reaching 25 degrees Celsius.",
    correctAnswer: "Tomorrow's weather will be partly cloudy with temperatures reaching 25 degrees Celsius.",
    difficulty: "medium",
    category: "News"
  },
  {
    id: "3",
    type: "comprehension",
    title: "Restaurant Order",
    audio: "I'd like to order the salmon with rice, and could I have a glass of water, please?",
    text: "I'd like to order the salmon with rice, and could I have a glass of water, please?",
    question: "What did the customer order for the main dish?",
    options: ["Chicken", "Salmon", "Beef", "Pasta"],
    correctAnswer: "Salmon",
    difficulty: "easy",
    category: "Daily Life"
  },
  {
    id: "4",
    type: "conversation",
    title: "Job Interview",
    audio: "Tell me about your previous work experience and why you're interested in this position.",
    text: "Tell me about your previous work experience and why you're interested in this position.",
    question: "What is the interviewer asking about?",
    options: ["Educational background", "Work experience and interest", "Salary expectations", "Available start date"],
    correctAnswer: "Work experience and interest",
    difficulty: "medium",
    category: "Business"
  }
];

interface ListeningSessionProps {
  onBack: () => void;
}

const ListeningSession: React.FC<ListeningSessionProps> = ({ onBack }) => {
  const [mode, setMode] = useState<"select" | "exercise">("select");
  const [selectedType, setSelectedType] = useState<"comprehension" | "dictation" | "conversation">("comprehension");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [dictationText, setDictationText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [playCount, setPlayCount] = useState(0);

  const currentExercise = listeningExercises.filter(ex => ex.type === selectedType)[currentExerciseIndex] || listeningExercises[0];
  const exercisesOfType = listeningExercises.filter(ex => ex.type === selectedType);
  const progress = ((currentExerciseIndex + 1) / exercisesOfType.length) * 100;

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      // Stop current speech if playing
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentExercise.audio);
      utterance.rate = playbackSpeed[0];
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setPlayCount(prev => prev + 1);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const pauseAudio = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleSubmitAnswer = () => {
    let isCorrect = false;
    
    if (currentExercise.type === "comprehension" || currentExercise.type === "conversation") {
      isCorrect = selectedOption === currentExercise.correctAnswer;
    } else if (currentExercise.type === "dictation") {
      // More lenient checking for dictation
      const userText = dictationText.toLowerCase().trim();
      const correctText = currentExercise.correctAnswer.toLowerCase().trim();
      const similarity = calculateSimilarity(userText, correctText);
      isCorrect = similarity > 0.8; // 80% similarity threshold
    }
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setTotalQuestions(prev => prev + 1);
    setShowResult(true);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const maxLength = Math.max(words1.length, words2.length);
    
    if (maxLength === 0) return 1;
    
    let matches = 0;
    words1.forEach(word => {
      if (words2.includes(word)) matches++;
    });
    
    return matches / maxLength;
  };

  const handleNextExercise = () => {
    const filteredExercises = listeningExercises.filter(ex => ex.type === selectedType);
    if (currentExerciseIndex < filteredExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      resetExercise();
    } else {
      alert(`Session complete! Score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)`);
    }
  };

  const resetExercise = () => {
    setUserAnswer("");
    setSelectedOption("");
    setDictationText("");
    setShowResult(false);
    setPlayCount(0);
    stopAudio();
  };

  const startSession = (type: "comprehension" | "dictation" | "conversation") => {
    setSelectedType(type);
    setMode("exercise");
    setCurrentExerciseIndex(0);
    setScore(0);
    setTotalQuestions(0);
    resetExercise();
  };

  useEffect(() => {
    return () => {
      // Cleanup speech synthesis on unmount
      window.speechSynthesis.cancel();
    };
  }, []);

  if (mode === "select") {
    return (
      <main className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Listening Mastery
          </h1>
          <p className="text-muted-foreground text-lg">Choose your listening exercise type</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => startSession("comprehension")}>
            <CardHeader className="text-center">
              <Headphones className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Listen & Answer</CardTitle>
              <CardDescription>Listen to audio and answer questions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Airport announcements</li>
                <li>• Restaurant conversations</li>
                <li>• Daily life scenarios</li>
              </ul>
              <Button className="w-full">Start Comprehension</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => startSession("dictation")}>
            <CardHeader className="text-center">
              <PenTool className="w-12 h-12 text-accent mx-auto mb-2" />
              <CardTitle>Dictation</CardTitle>
              <CardDescription>Listen and type what you hear</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Weather reports</li>
                <li>• News segments</li>
                <li>• Instructions</li>
              </ul>
              <Button variant="outline" className="w-full">Start Dictation</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => startSession("conversation")}>
            <CardHeader className="text-center">
              <MessageSquare className="w-12 h-12 text-secondary-foreground mx-auto mb-2" />
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Real-life dialogue comprehension</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Job interviews</li>
                <li>• Phone calls</li>
                <li>• Business meetings</li>
              </ul>
              <Button variant="secondary" className="w-full">Start Conversations</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-3xl py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => setMode("select")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant={currentExercise.difficulty === "easy" ? "secondary" : currentExercise.difficulty === "medium" ? "default" : "destructive"}>
            {currentExercise.difficulty}
          </Badge>
          <Badge variant="outline">{currentExercise.category}</Badge>
          <Badge variant="outline">Score: {score}/{totalQuestions}</Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">{currentExerciseIndex + 1}/{exercisesOfType.length}</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <Card className="backdrop-card shadow-glow">
        <CardHeader>
          <CardTitle className="text-2xl">{currentExercise.title}</CardTitle>
          <CardDescription>
            {currentExercise.type === "comprehension" && "Listen carefully and answer the question"}
            {currentExercise.type === "dictation" && "Listen and type exactly what you hear"}
            {currentExercise.type === "conversation" && "Listen to the conversation and answer the question"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button onClick={playAudio} disabled={isPlaying} size="lg">
                <Play className="w-6 h-6 mr-2" />
                {playCount > 0 ? `Play Again (${playCount})` : "Play Audio"}
              </Button>
              <Button onClick={pauseAudio} disabled={!isPlaying} variant="outline">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button onClick={() => { stopAudio(); setPlayCount(0); }} variant="ghost">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Playback Speed: {playbackSpeed[0]}x</Label>
                <Badge variant="outline">{playbackSpeed[0] < 1 ? "Slow" : playbackSpeed[0] === 1 ? "Normal" : "Fast"}</Badge>
              </div>
              <Slider
                value={playbackSpeed}
                onValueChange={setPlaybackSpeed}
                max={2}
                min={0.5}
                step={0.25}
                className="w-full"
              />
            </div>
          </div>

          {/* Exercise Content */}
          {!showResult ? (
            <>
              {(currentExercise.type === "comprehension" || currentExercise.type === "conversation") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{currentExercise.question}</h3>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    <div className="grid gap-4">
                      {currentExercise.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="cursor-pointer text-lg hover:text-primary">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {currentExercise.type === "dictation" && (
                <div className="space-y-4">
                  <Label htmlFor="dictation" className="text-lg font-semibold">Type what you hear:</Label>
                  <Textarea
                    id="dictation"
                    value={dictationText}
                    onChange={(e) => setDictationText(e.target.value)}
                    placeholder="Start typing here..."
                    className="min-h-[120px] text-lg"
                  />
                  <div className="text-sm text-muted-foreground">
                    Tip: You can play the audio multiple times. Don't worry about perfect punctuation.
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSubmitAnswer}
                disabled={
                  (currentExercise.type === "comprehension" || currentExercise.type === "conversation") ? !selectedOption : 
                  currentExercise.type === "dictation" ? !dictationText.trim() : false
                }
                className="w-full bg-gradient-primary"
              >
                Submit Answer
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-lg border-2",
                (() => {
                  if (currentExercise.type === "dictation") {
                    const similarity = calculateSimilarity(
                      dictationText.toLowerCase().trim(),
                      currentExercise.correctAnswer.toLowerCase().trim()
                    );
                    return similarity > 0.8 ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30";
                  } else {
                    return selectedOption === currentExercise.correctAnswer ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30";
                  }
                })()
              )}>
                <div className="flex items-center gap-2 mb-3">
                  {(() => {
                    if (currentExercise.type === "dictation") {
                      const similarity = calculateSimilarity(
                        dictationText.toLowerCase().trim(),
                        currentExercise.correctAnswer.toLowerCase().trim()
                      );
                      return similarity > 0.8 ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      );
                    } else {
                      return selectedOption === currentExercise.correctAnswer ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      );
                    }
                  })()}
                  <span className="font-semibold text-lg">
                    {(() => {
                      if (currentExercise.type === "dictation") {
                        const similarity = calculateSimilarity(
                          dictationText.toLowerCase().trim(),
                          currentExercise.correctAnswer.toLowerCase().trim()
                        );
                        return similarity > 0.8 ? "Excellent!" : "Good try!";
                      } else {
                        return selectedOption === currentExercise.correctAnswer ? "Correct!" : "Incorrect";
                      }
                    })()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p><strong>Your answer:</strong> {currentExercise.type === "dictation" ? dictationText : selectedOption}</p>
                  {((currentExercise.type === "dictation" && calculateSimilarity(dictationText.toLowerCase().trim(), currentExercise.correctAnswer.toLowerCase().trim()) <= 0.8) || 
                    (currentExercise.type !== "dictation" && selectedOption !== currentExercise.correctAnswer)) && (
                    <p><strong>Correct answer:</strong> {currentExercise.correctAnswer}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Audio Script:</h4>
                <p className="text-muted-foreground italic">"{currentExercise.text}"</p>
              </div>

              <Button onClick={handleNextExercise} className="w-full">
                {currentExerciseIndex < exercisesOfType.length - 1 ? "Next Exercise" : "Complete Session"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ListeningSession;