import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle, Mic, MicOff, Volume2, Users, Coffee, Briefcase, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  context: string;
  steps: ConversationStep[];
}

interface ConversationStep {
  id: string;
  speaker: "system" | "user" | "bot";
  text: string;
  options?: string[];
  userResponse?: string;
  feedback?: string;
}

const conversationScenarios: ConversationScenario[] = [
  {
    id: "1",
    title: "Ordering Food at a Restaurant",
    description: "Practice ordering food and drinks at a restaurant",
    icon: <Coffee className="w-6 h-6" />,
    difficulty: "easy",
    category: "Daily Life",
    context: "You are at a restaurant and the waiter approaches your table.",
    steps: [
      {
        id: "1",
        speaker: "system",
        text: "The waiter approaches your table with a smile.",
      },
      {
        id: "2",
        speaker: "bot",
        text: "Good evening! Welcome to our restaurant. Have you had a chance to look at the menu?",
      },
      {
        id: "3",
        speaker: "user",
        text: "",
        options: [
          "Yes, I'd like to order please.",
          "Could I have a few more minutes?",
          "What do you recommend?",
          "I'm ready to order now."
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Job Interview",
    description: "Practice common job interview questions and responses",
    icon: <Briefcase className="w-6 h-6" />,
    difficulty: "medium",
    category: "Business",
    context: "You are in a job interview for a marketing position.",
    steps: [
      {
        id: "1",
        speaker: "system",
        text: "You enter the interview room. The hiring manager greets you professionally.",
      },
      {
        id: "2",
        speaker: "bot",
        text: "Good morning! Thank you for coming in today. Please tell me about yourself and your background in marketing.",
      },
      {
        id: "3",
        speaker: "user",
        text: "",
        options: [
          "I have 5 years of experience in digital marketing...",
          "I'm passionate about marketing and have worked on various campaigns...",
          "I recently graduated with a marketing degree...",
          "I've been working in sales but want to transition to marketing..."
        ]
      }
    ]
  },
  {
    id: "3",
    title: "Airport Check-in",
    description: "Practice airport conversations and travel vocabulary",
    icon: <Plane className="w-6 h-6" />,
    difficulty: "medium",
    category: "Travel",
    context: "You are at the airport check-in counter for an international flight.",
    steps: [
      {
        id: "1",
        speaker: "system",
        text: "You approach the check-in counter at the airport.",
      },
      {
        id: "2",
        speaker: "bot",
        text: "Good morning! May I see your passport and ticket, please?",
      },
      {
        id: "3",
        speaker: "user",
        text: "",
        options: [
          "Here you go. I'm traveling to London.",
          "Of course, here's my documentation.",
          "Yes, here's my passport. I have an e-ticket.",
          "Sure, I'm on the 2 PM flight to London."
        ]
      }
    ]
  },
  {
    id: "4",
    title: "Meeting New People",
    description: "Practice introductions and small talk",
    icon: <Users className="w-6 h-6" />,
    difficulty: "easy",
    category: "Social",
    context: "You're at a networking event and someone approaches you.",
    steps: [
      {
        id: "1",
        speaker: "system",
        text: "At a networking event, a friendly person approaches you.",
      },
      {
        id: "2",
        speaker: "bot",
        text: "Hi there! I don't think we've met. I'm Sarah, I work in software development. What about you?",
      },
      {
        id: "3",
        speaker: "user",
        text: "",
        options: [
          "Nice to meet you, Sarah. I'm Alex, I work in marketing.",
          "Hello Sarah! I'm new here, I work in graphic design.",
          "Hi! I'm Jordan, I'm a teacher. Great to meet you!",
          "Hey Sarah, I'm Sam. I work in project management."
        ]
      }
    ]
  }
];

interface ConversationSessionProps {
  onBack: () => void;
}

const ConversationSession: React.FC<ConversationSessionProps> = ({ onBack }) => {
  const [mode, setMode] = useState<"select" | "conversation">("select");
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationStep[]>([]);
  const [selectedResponse, setSelectedResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(0);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  const recognition = useRef<SpeechRecognition | null>(null);

  React.useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setRecognitionSupported(true);
    }
  }, []);

  const startScenario = (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
    setMode("conversation");
    setCurrentStepIndex(0);
    setConversationHistory([]);
    setScore(0);
  };

  const playAudioText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleResponseSelect = (response: string) => {
    if (!selectedScenario) return;

    const currentStep = selectedScenario.steps[currentStepIndex];
    
    // Add user response to history
    const userStep: ConversationStep = {
      ...currentStep,
      userResponse: response,
      text: response
    };
    
    setConversationHistory(prev => [...prev, userStep]);
    
    // Simple scoring based on response quality (you can make this more sophisticated)
    if (response.length > 20) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => prev + 5);
    }
    
    // Move to next step or end conversation
    if (currentStepIndex < selectedScenario.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedResponse("");
    } else {
      // Conversation complete
      alert(`Conversation complete! Your score: ${score + (response.length > 20 ? 10 : 5)} points`);
    }
  };

  const startSpeechRecognition = () => {
    if (!recognitionSupported) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      setIsRecording(true);
      setTranscript("");
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      handleResponseSelect(transcript);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    recognition.current = recognitionInstance;
    recognitionInstance.start();
  };

  if (mode === "select") {
    return (
      <main className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Conversation Practice
          </h1>
          <p className="text-muted-foreground text-lg">Choose a scenario to practice real-life conversations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {conversationScenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" 
              onClick={() => startScenario(scenario)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {scenario.icon}
                    <CardTitle className="text-xl">{scenario.title}</CardTitle>
                  </div>
                  <Badge variant={scenario.difficulty === "easy" ? "secondary" : scenario.difficulty === "medium" ? "default" : "destructive"}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <Badge variant="outline" className="w-fit">{scenario.category}</Badge>
                <CardDescription className="mt-2">{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{scenario.context}</p>
                <Button className="w-full bg-gradient-primary">Start Conversation</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (!selectedScenario) return null;

  const currentStep = selectedScenario.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / selectedScenario.steps.length) * 100;

  return (
    <main className="container max-w-3xl py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => setMode("select")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant={selectedScenario.difficulty === "easy" ? "secondary" : selectedScenario.difficulty === "medium" ? "default" : "destructive"}>
            {selectedScenario.difficulty}
          </Badge>
          <Badge variant="outline">{selectedScenario.category}</Badge>
          <Badge variant="outline">Score: {score}</Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Conversation Progress</span>
          <span className="text-sm font-medium">{currentStepIndex + 1}/{selectedScenario.steps.length}</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <Card className="backdrop-card shadow-glow">
        <CardHeader>
          <div className="flex items-center gap-2">
            {selectedScenario.icon}
            <CardTitle>{selectedScenario.title}</CardTitle>
          </div>
          <CardDescription>{selectedScenario.context}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {conversationHistory.map((step, index) => (
                <div key={index} className={cn(
                  "p-3 rounded-lg",
                  step.speaker === "bot" ? "bg-muted/50 mr-8" : "bg-primary/10 ml-8"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {step.speaker === "bot" ? "Assistant" : "You"}
                    </Badge>
                  </div>
                  <p>{step.userResponse || step.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Current Step */}
          {currentStep.speaker === "system" && (
            <div className="p-4 bg-accent/10 rounded-lg border-l-4 border-accent">
              <p className="text-accent-foreground font-medium">{currentStep.text}</p>
            </div>
          )}

          {currentStep.speaker === "bot" && (
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg mr-8">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Assistant</Badge>
                  <Button variant="ghost" size="sm" onClick={() => playAudioText(currentStep.text)}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                <p>{currentStep.text}</p>
              </div>
            </div>
          )}

          {currentStep.speaker === "user" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How would you respond?</h3>
              
              {/* Multiple Choice Options */}
              {currentStep.options && (
                <RadioGroup value={selectedResponse} onValueChange={setSelectedResponse}>
                  <div className="space-y-3">
                    {currentStep.options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <RadioGroupItem value={option} id={option} className="mt-1" />
                        <Label htmlFor={option} className="cursor-pointer text-base hover:text-primary leading-relaxed">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={() => handleResponseSelect(selectedResponse)}
                  disabled={!selectedResponse}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Response
                </Button>
                
                {recognitionSupported && (
                  <Button
                    onClick={startSpeechRecognition}
                    disabled={isRecording}
                    variant="outline"
                    className={cn(
                      "flex-1",
                      isRecording && "bg-red-500 hover:bg-red-600 text-white"
                    )}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Listening...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Speak Response
                      </>
                    )}
                  </Button>
                )}
              </div>

              {transcript && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">You said:</p>
                  <p className="font-medium">{transcript}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

// Add speech recognition types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default ConversationSession;