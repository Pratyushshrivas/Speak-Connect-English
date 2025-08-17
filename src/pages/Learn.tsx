import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Headphones, Mic, MessageSquare, Sparkles, History } from "lucide-react";
import VocabularySession from "@/components/sessions/VocabularySession";
import GrammarSession from "@/components/sessions/GrammarSession";
import PronunciationSession from "@/components/sessions/PronunciationSession";
import ListeningSession from "@/components/sessions/ListeningSession";
import ConversationSession from "@/components/sessions/ConversationSession";
import ReviewSession from "@/components/sessions/ReviewSession";

const Learn = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);

  if (activeSession === "vocabulary") {
    return <VocabularySession onBack={() => setActiveSession(null)} />;
  }
  if (activeSession === "grammar") {
    return <GrammarSession onBack={() => setActiveSession(null)} />;
  }
  if (activeSession === "pronunciation") {
    return <PronunciationSession onBack={() => setActiveSession(null)} />;
  }
  if (activeSession === "listening") {
    return <ListeningSession onBack={() => setActiveSession(null)} />;
  }
  if (activeSession === "conversation") {
    return <ConversationSession onBack={() => setActiveSession(null)} />;
  }
  if (activeSession === "review") {
    return <ReviewSession onBack={() => setActiveSession(null)} />;
  }

  return (
    <main className="container py-10">
      <SEO title="English Learning Sessions — SpeakConnect" description="Daily English lessons: vocabulary, grammar, pronunciation, and listening drills with XP and streaks." canonical="/learn" />
      <h1 className="text-3xl font-bold mb-6">English Learning Sessions</h1>
      <p className="text-muted-foreground mb-8">Short, interactive sessions designed to build real communication skills.</p>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Book className="text-primary" /> Vocabulary Builder</CardTitle>
            <CardDescription>Flashcards, matching games, spaced repetition.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="secondary" onClick={() => setActiveSession("vocabulary")}>Start</Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Grammar Practice</CardTitle>
            <CardDescription>Fill-in-the-blanks and MCQs with instant feedback.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="secondary" onClick={() => setActiveSession("grammar")}>Start</Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mic className="text-primary" /> Pronunciation Practice</CardTitle>
            <CardDescription>Repeat-after-audio with AI scoring (soon).</CardDescription>
          </CardHeader>
          <CardContent><Button variant="secondary" onClick={() => setActiveSession("pronunciation")}>Start</Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Headphones className="text-primary" /> Listening Mastery</CardTitle>
            <CardDescription>Listen & answer, transcribe short clips.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="secondary" onClick={() => setActiveSession("listening")}>Start</Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="text-primary" /> Conversation Drills</CardTitle>
            <CardDescription>Role-plays like ordering food, travel talk.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="secondary" onClick={() => setActiveSession("conversation")}>Start</Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="text-primary" /> Review & Feedback</CardTitle>
            <CardDescription>Mistakes recap, suggested practice.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="secondary" onClick={() => setActiveSession("review")}>Start</Button></CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Learn;