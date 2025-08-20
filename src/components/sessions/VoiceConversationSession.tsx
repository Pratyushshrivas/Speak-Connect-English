import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, PhoneOff, Mic, MicOff, Volume2, Users, Coffee, Briefcase, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  context: string;
  systemPrompt: string;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
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
    systemPrompt: "You are a friendly waiter at a restaurant. Help the customer order food and drinks. Ask about their preferences, make recommendations, and guide them through the ordering process. Keep responses natural and conversational, around 1-2 sentences."
  },
  {
    id: "2",
    title: "Job Interview",
    description: "Practice common job interview questions and responses",
    icon: <Briefcase className="w-6 h-6" />,
    difficulty: "medium",
    category: "Business",
    context: "You are in a job interview for a marketing position.",
    systemPrompt: "You are a professional hiring manager conducting a job interview for a marketing position. Ask relevant questions about experience, skills, and motivation. Be encouraging but professional. Keep responses focused and around 1-2 sentences."
  },
  {
    id: "3",
    title: "Airport Check-in",
    description: "Practice airport conversations and travel vocabulary",
    icon: <Plane className="w-6 h-6" />,
    difficulty: "medium",
    category: "Travel",
    context: "You are at the airport check-in counter for an international flight.",
    systemPrompt: "You are a helpful airport check-in agent. Assist the passenger with check-in procedures, ask about luggage, seat preferences, and provide travel information. Be efficient and professional. Keep responses brief and to the point."
  },
  {
    id: "4",
    title: "Meeting New People",
    description: "Practice introductions and small talk",
    icon: <Users className="w-6 h-6" />,
    difficulty: "easy",
    category: "Social",
    context: "You're at a networking event and someone approaches you.",
    systemPrompt: "You are a friendly person at a networking event. Engage in natural small talk, ask about their work and interests, and share about yourself. Keep the conversation light and engaging. Respond in 1-2 sentences."
  }
];

interface VoiceConversationSessionProps {
  onBack: () => void;
}

const VoiceConversationSession: React.FC<VoiceConversationSessionProps> = ({ onBack }) => {
  const [mode, setMode] = useState<"select" | "conversation">("select");
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
    setMode("conversation");
    setIsInCall(true);
    setCallDuration(0);
    callStartTimeRef.current = new Date();
    
    // Start timer
    timerIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000);
        setCallDuration(elapsed);
      }
    }, 1000);

    // Add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content: scenario.context,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Speak welcome message
    await speakText(scenario.context);
    
    toast.success("Call started! You can now speak with the AI.");
  };

  const endCall = () => {
    setIsInCall(false);
    setIsRecording(false);
    setIsProcessing(false);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    toast.success(`Call ended. Duration: ${formatCallDuration(callDuration)}`);
    setMode("select");
    setMessages([]);
    setCallDuration(0);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Voice recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        processAudio();
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to speech-to-text
        const { data, error } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio }
        });

        if (error) {
          console.error('Speech-to-text error:', error);
          toast.error("Failed to process speech");
          setIsProcessing(false);
          return;
        }

        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: data.text,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        // Get AI response
        await getAIResponse(data.text);
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process audio");
      setIsProcessing(false);
    }
  };

  const getAIResponse = async (userMessage: string) => {
    if (!selectedScenario) return;

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: userMessage,
          systemPrompt: selectedScenario.systemPrompt,
          conversationHistory
        }
      });

      if (error) {
        console.error('AI conversation error:', error);
        toast.error("Failed to get AI response");
        setIsProcessing(false);
        return;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak AI response
      await speakText(data.message);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get AI response");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (error) {
        console.error('Text-to-speech error:', error);
        return;
      }

      // Play audio
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], {
        type: 'audio/mpeg'
      });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      await audioRef.current.play();
      
    } catch (error) {
      console.error("Error speaking text:", error);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (mode === "select") {
    return (
      <main className="container max-w-4xl py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="hover:bg-secondary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              AI Voice Conversation
            </h1>
            <p className="text-muted-foreground text-lg">Practice real conversations with AI in different scenarios</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {conversationScenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" 
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
                <Button 
                  className="w-full bg-gradient-primary"
                  onClick={() => startCall(scenario)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Start Voice Call
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (!selectedScenario) return null;

  return (
    <main className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={endCall}
            className="hover:bg-secondary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedScenario.title}</h2>
            <p className="text-muted-foreground">{selectedScenario.description}</p>
          </div>
        </div>
        
        {/* Call Status */}
        <div className="flex items-center gap-4">
          <Badge variant={selectedScenario.difficulty === "easy" ? "secondary" : selectedScenario.difficulty === "medium" ? "default" : "destructive"}>
            {selectedScenario.difficulty}
          </Badge>
          <Badge variant="outline">{selectedScenario.category}</Badge>
          {isInCall && (
            <Badge variant="default" className="bg-green-500">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              {formatCallDuration(callDuration)}
            </Badge>
          )}
        </div>
      </div>

      {/* Conversation Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card className="backdrop-card shadow-glow h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedScenario.icon}
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-4 rounded-lg max-w-[80%]",
                    message.role === 'ai' 
                      ? "bg-muted/50 mr-auto" 
                      : "bg-primary/10 ml-auto"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {message.role === 'ai' ? 'AI Assistant' : 'You'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
              
              {isProcessing && (
                <div className="bg-muted/50 rounded-lg p-4 mr-auto max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">AI Assistant</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call Controls */}
        <div className="space-y-4">
          <Card className="backdrop-card">
            <CardHeader>
              <CardTitle>Call Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mic Button */}
              <Button
                onClick={handleMicClick}
                disabled={isProcessing}
                className={cn(
                  "w-full h-16 text-lg",
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                    : "bg-green-500 hover:bg-green-600"
                )}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-6 h-6 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-2" />
                    {isProcessing ? "Processing..." : "Hold to Speak"}
                  </>
                )}
              </Button>

              {/* Mute Button */}
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="outline"
                className="w-full"
              >
                {isMuted ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio On
                  </>
                )}
              </Button>

              {/* End Call */}
              <Button
                onClick={endCall}
                variant="destructive"
                className="w-full"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            </CardContent>
          </Card>

          {/* Call Stats */}
          <Card className="backdrop-card">
            <CardHeader>
              <CardTitle>Call Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-mono">{formatCallDuration(callDuration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages:</span>
                <span>{messages.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={isInCall ? "default" : "secondary"} className="text-xs">
                  {isInCall ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default VoiceConversationSession;