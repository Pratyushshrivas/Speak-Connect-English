import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIConversationInterfaceProps {
  onBack: () => void;
}

const AIConversationInterface: React.FC<AIConversationInterfaceProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'ai',
      content: "Hello! I'm your AI English conversation partner. Press the microphone button to start speaking, and I'll help you practice your English. What would you like to talk about today?",
      timestamp: new Date()
    }]);

    // Speak the welcome message
    speakText("Hello! I'm your AI English conversation partner. Press the microphone button to start speaking, and I'll help you practice your English. What would you like to talk about today?");
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak naturally and press stop when finished",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to speech-to-text
        const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio }
        });

        if (sttError) throw sttError;
        
        const transcribedText = sttData.text;
        if (!transcribedText || transcribedText.trim().length === 0) {
          toast({
            title: "No speech detected",
            description: "Please try speaking more clearly",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: transcribedText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // Get AI response
        const conversationHistory = messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }));

        const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-conversation', {
          body: { 
            message: transcribedText,
            conversationHistory
          }
        });

        if (aiError) throw aiError;

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: aiData.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);

        // Speak AI response
        await speakText(aiData.response);
        
        setIsProcessing(false);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Failed to process your speech. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsPlaying(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'Sarah' }
      });

      if (error) throw error;

      // Create audio element and play
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Audio playback error');
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsPlaying(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="hover:bg-secondary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Conversation Practice
            </h1>
            <p className="text-muted-foreground">Practice speaking English with your AI partner</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'AI Partner'}
                    </p>
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleMicClick}
              disabled={isProcessing || isPlaying}
              size="lg"
              className={`w-20 h-20 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            
            <div className="text-center">
              {isProcessing && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Processing your speech...
                </p>
              )}
              {isPlaying && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  AI is speaking...
                </p>
              )}
              {!isProcessing && !isPlaying && (
                <p className="text-sm text-muted-foreground">
                  {isRecording ? 'Click to stop recording' : 'Click to start speaking'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversationInterface;