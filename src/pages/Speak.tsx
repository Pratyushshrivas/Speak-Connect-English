import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceCall } from "@/hooks/useVoiceCall";
import CallInterface from "@/components/call/CallInterface";
import MatchmakingInterface from "@/components/call/MatchmakingInterface";
import AIConversationInterface from "@/components/ai/AIConversationInterface";
import { PhoneCall, ShieldCheck, Timer, Users, MessageCircle, Shuffle, Heart, Bot, ArrowLeft, ArrowRight } from "lucide-react";

const topics = [
  'Travel & Culture', 'Food & Cooking', 'Technology', 'Sports & Fitness',
  'Movies & Entertainment', 'Work & Career', 'Hobbies & Interests', 'Daily Life'
];

const Speak = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { callStatus, startMatchmaking } = useVoiceCall();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'ai-conversation'>('main');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleStartCall = (callType: 'one_on_one' | 'group' | 'topic' | 'free') => {
    if (!user) return;
    
    if (callType === 'topic' && !selectedTopic) {
      return;
    }
    
    startMatchmaking(callType, callType === 'topic' ? selectedTopic : undefined);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  if (!user) return null;

  // Show AI conversation interface
  if (currentView === 'ai-conversation') {
    return <AIConversationInterface onBack={handleBackToMain} />;
  }

  // Show call interface if in a call
  if (callStatus === 'connected') {
    return (
      <main className="container py-10">
        <CallInterface onEndCall={() => {}} />
      </main>
    );
  }

  // Show matchmaking interface if searching
  if (callStatus === 'matching') {
    return (
      <main className="container py-10">
        <MatchmakingInterface onCancel={() => {}} />
      </main>
    );
  }

  return (
    <main className="container py-10">
      <SEO title="Practice Speaking — Random Voice Calls | SpeakConnect" description="Find a random partner by level and practice English speaking with prompts and safety features." canonical="/speak" />
      
      <div className="flex items-center gap-4 mb-10">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBackToHome}
          className="hover:bg-secondary/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Practice Speaking — Voice Calls</h1>
          <p className="text-muted-foreground text-lg">Match with learners worldwide and improve your English speaking skills</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {/* AI Conversation */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Conversation Partner
            </CardTitle>
            <CardDescription>
              Practice with intelligent AI assistant anytime
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">Free</Badge>
              <Badge variant="secondary">Unlimited</Badge>
              <Badge className="bg-green-100 text-green-800">Available 24/7</Badge>
            </div>
            <Button 
              onClick={() => setCurrentView('ai-conversation')}
              className="w-full"
              variant="hero"
            >
              Start AI Chat <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                <span>AI powered</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Safe practice</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1-on-1 Session */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-primary" />
              1-on-1 Session
            </CardTitle>
            <CardDescription>
              Connect with one partner for focused conversation practice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">Level matching</Badge>
              <Badge variant="secondary">2 min timeout</Badge>
            </div>
            <Button 
              onClick={() => handleStartCall('one_on_one')} 
              className="w-full"
              variant="hero"
            >
              Find Partner
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>3-10 min</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Safe & moderated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Call */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Group Call (4 People)
            </CardTitle>
            <CardDescription>
              Join a group conversation with up to 4 learners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">4 participants</Badge>
              <Badge variant="secondary">Random topics</Badge>
            </div>
            <Button 
              onClick={() => handleStartCall('group')} 
              className="w-full"
              variant="outline"
            >
              Join Group
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>5-15 min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Multiple speakers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Talk */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Topic Talk
            </CardTitle>
            <CardDescription>
              Choose a topic and find someone with similar interests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => handleStartCall('topic')} 
              className="w-full"
              variant="outline"
              disabled={!selectedTopic}
            >
              Find Topic Partner
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>Shared interests</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>Guided conversation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Talk */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-primary" />
              Free Talk (Random)
            </CardTitle>
            <CardDescription>
              Quick random pairing for spontaneous conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">Instant pairing</Badge>
              <Badge variant="secondary">No topic</Badge>
            </div>
            <Button 
              onClick={() => handleStartCall('free')} 
              className="w-full"
              variant="outline"
            >
              Random Partner
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shuffle className="h-4 w-4" />
                <span>Random match</span>
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>Quick practice</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Safe & Secure Calls
            </h3>
            <p className="text-muted-foreground text-sm">
              All calls are secured with WebRTC encryption. Report inappropriate behavior anytime. 
              Calls are not recorded, ensuring your privacy and comfort while learning.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Speak;