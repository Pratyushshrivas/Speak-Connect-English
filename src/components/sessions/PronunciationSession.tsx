import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mic, MicOff, Volume2, RotateCcw, CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PronunciationWord {
  id: string;
  word: string;
  phonetic: string;
  difficulty: "easy" | "medium" | "hard";
  tips?: string;
  category: string;
}

const pronunciationWords: PronunciationWord[] = [
  {
    id: "1",
    word: "Entrepreneurship",
    phonetic: "/ˌɑːntrəprəˈnɜːrʃɪp/",
    difficulty: "hard",
    tips: "Break it down: En-tre-pre-neur-ship",
    category: "Business"
  },
  {
    id: "2", 
    word: "Through",
    phonetic: "/θruː/",
    difficulty: "medium",
    tips: "The 'th' sound is made by putting your tongue between your teeth",
    category: "Common Words"
  },
  {
    id: "3",
    word: "Pronunciation",
    phonetic: "/prəˌnʌnsiˈeɪʃən/",
    difficulty: "medium",
    tips: "Notice it's 'nun-ci-a-tion', not 'noun-ci-a-tion'",
    category: "Academic"
  },
  {
    id: "4",
    word: "Phenomenon",
    phonetic: "/fəˈnɒmɪnən/",
    difficulty: "hard",
    tips: "Stress on the second syllable: phe-NOM-e-non",
    category: "Scientific"
  }
];

const minimalPairs = [
  { word1: "Ship", word2: "Sheep", focus: "/ɪ/ vs /iː/" },
  { word1: "Bit", word2: "Beat", focus: "/ɪ/ vs /iː/" },
  { word1: "Think", word2: "Sink", focus: "/θ/ vs /s/" },
  { word1: "Three", word2: "Tree", focus: "/θ/ vs /tr/" }
];

interface PronunciationSessionProps {
  onBack: () => void;
}

const PronunciationSession: React.FC<PronunciationSessionProps> = ({ onBack }) => {
  const [mode, setMode] = useState<"select" | "practice" | "minimal-pairs" | "recording">("select");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const currentWord = pronunciationWords[currentWordIndex];
  const currentPair = minimalPairs[currentPairIndex];
  const progress = ((currentWordIndex + 1) / pronunciationWords.length) * 100;

  const playWordAudio = useCallback((word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to practice pronunciation.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setAttempts(prev => prev + 1);
    }
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      
      // Simple matching - check if the spoken word is close to target
      const similarity = calculateSimilarity(transcript.toLowerCase(), currentWord.word.toLowerCase());
      if (similarity > 0.7) {
        setScore(prev => prev + 10);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognition);
    recognition.start();
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const nextWord = () => {
    if (currentWordIndex < pronunciationWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setRecordedAudio(null);
      setTranscript("");
      setAttempts(0);
    } else {
      alert(`Session complete! Final score: ${score} | Total attempts: ${attempts}`);
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
            Pronunciation Practice
          </h1>
          <p className="text-muted-foreground text-lg">Choose your practice mode</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => setMode("practice")}>
            <CardHeader className="text-center">
              <Mic className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Word Practice</CardTitle>
              <CardDescription>Practice individual words with feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Practice</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => setMode("minimal-pairs")}>
            <CardHeader className="text-center">
              <Volume2 className="w-12 h-12 text-accent mx-auto mb-2" />
              <CardTitle>Minimal Pairs</CardTitle>
              <CardDescription>Practice similar sounding words</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Practice Pairs</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => setMode("recording")}>
            <CardHeader className="text-center">
              <Play className="w-12 h-12 text-secondary-foreground mx-auto mb-2" />
              <CardTitle>Record & Compare</CardTitle>
              <CardDescription>Record yourself and compare</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">Start Recording</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (mode === "practice") {
    return (
      <main className="container max-w-2xl py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setMode("select")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Score: {score}</Badge>
            <Badge variant="secondary">Attempts: {attempts}</Badge>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{currentWordIndex + 1}/{pronunciationWords.length}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="backdrop-card shadow-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant={currentWord.difficulty === "easy" ? "secondary" : currentWord.difficulty === "medium" ? "default" : "destructive"}>
                {currentWord.difficulty}
              </Badge>
              <Badge variant="outline">{currentWord.category}</Badge>
            </div>
            <CardTitle className="text-4xl font-bold text-primary mb-2">{currentWord.word}</CardTitle>
            <p className="text-lg text-muted-foreground font-mono">{currentWord.phonetic}</p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Button onClick={() => playWordAudio(currentWord.word)} variant="outline" size="lg">
              <Volume2 className="w-5 h-5 mr-2" />
              Listen
            </Button>

            {currentWord.tips && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">💡 Tip: {currentWord.tips}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={isListening ? () => recognition?.stop() : startSpeechRecognition}
                className={cn(
                  "w-full h-16 text-lg",
                  isListening ? "bg-red-500 hover:bg-red-600" : "bg-gradient-primary"
                )}
                disabled={!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)}
              >
                <Mic className="w-6 h-6 mr-2" />
                {isListening ? "Stop & Analyze" : "Start Speaking"}
              </Button>

              {transcript && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">You said:</p>
                  <p className="text-lg font-semibold">{transcript}</p>
                  {transcript.toLowerCase() === currentWord.word.toLowerCase() ? (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Perfect pronunciation!</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-amber-600">
                      <p>Keep practicing! Try to match: {currentWord.word}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button onClick={nextWord} variant="outline" className="w-full">
              {currentWordIndex < pronunciationWords.length - 1 ? "Next Word" : "Complete Session"}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (mode === "minimal-pairs") {
    return (
      <main className="container max-w-3xl py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setMode("select")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Badge variant="outline">{currentPairIndex + 1}/{minimalPairs.length}</Badge>
        </div>

        <Card className="backdrop-card shadow-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Minimal Pairs Practice</CardTitle>
            <p className="text-muted-foreground">Focus on: {currentPair.focus}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-primary">{currentPair.word1}</h3>
                  <Button onClick={() => playWordAudio(currentPair.word1)} variant="outline">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-accent">{currentPair.word2}</h3>
                  <Button onClick={() => playWordAudio(currentPair.word2)} variant="outline">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Practice saying both words clearly</p>
              <Button
                onClick={isListening ? () => recognition?.stop() : startSpeechRecognition}
                className={cn(
                  "w-full h-14",
                  isListening ? "bg-red-500 hover:bg-red-600" : "bg-gradient-primary"
                )}
              >
                <Mic className="w-5 h-5 mr-2" />
                {isListening ? "Stop Recording" : "Practice Speaking"}
              </Button>

              {transcript && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">You said:</p>
                  <p className="text-lg font-semibold">{transcript}</p>
                </div>
              )}
            </div>

            <Button 
              onClick={() => {
                if (currentPairIndex < minimalPairs.length - 1) {
                  setCurrentPairIndex(prev => prev + 1);
                  setTranscript("");
                } else {
                  alert("Minimal pairs practice complete!");
                }
              }}
              className="w-full"
            >
              {currentPairIndex < minimalPairs.length - 1 ? "Next Pair" : "Complete Practice"}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return null;
};

// Add speech recognition types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default PronunciationSession;