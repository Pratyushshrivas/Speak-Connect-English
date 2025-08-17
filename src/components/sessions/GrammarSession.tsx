import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, XCircle, BookOpen, Brain, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarQuestion {
  id: string;
  type: "fill-blank" | "multiple-choice";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  level: "beginner" | "intermediate" | "advanced";
}

const grammarQuestions: GrammarQuestion[] = [
  {
    id: "1",
    type: "multiple-choice",
    question: "She ___ to school every day.",
    options: ["go", "goes", "going", "gone"],
    correctAnswer: "goes",
    explanation: "Use 'goes' with third-person singular subjects (he/she/it) in present simple tense.",
    level: "beginner"
  },
  {
    id: "2",
    type: "fill-blank", 
    question: "If I ___ rich, I would travel the world.",
    correctAnswer: "were",
    explanation: "Use 'were' in hypothetical conditional sentences (second conditional), even with 'I'.",
    level: "intermediate"
  },
  {
    id: "3",
    type: "multiple-choice",
    question: "By the time she arrives, we ___ dinner.",
    options: ["will finish", "will have finished", "are finishing", "finish"],
    correctAnswer: "will have finished",
    explanation: "Use future perfect tense for actions that will be completed before a future point in time.",
    level: "advanced"
  },
  {
    id: "4",
    type: "fill-blank",
    question: "The book ___ by millions of people worldwide.",
    correctAnswer: "is read",
    explanation: "Use passive voice (is/are + past participle) when the action is more important than who performs it.",
    level: "intermediate"
  }
];

interface GrammarSessionProps {
  onBack: () => void;
}

const GrammarSession: React.FC<GrammarSessionProps> = ({ onBack }) => {
  const [mode, setMode] = useState<"select" | "quiz">("select");
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const currentQuestion = grammarQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / grammarQuestions.length) * 100;

  const handleSubmitAnswer = () => {
    const answer = currentQuestion.type === "fill-blank" ? userAnswer.trim().toLowerCase() : selectedOption;
    const isCorrect = answer === currentQuestion.correctAnswer.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setTotalQuestions(prev => prev + 1);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < grammarQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer("");
      setSelectedOption("");
      setShowResult(false);
    } else {
      // Quiz complete
      alert(`Quiz complete! Score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)`);
    }
  };

  const startQuiz = (level: "beginner" | "intermediate" | "advanced") => {
    setSelectedLevel(level);
    setMode("quiz");
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalQuestions(0);
  };

  if (mode === "select") {
    return (
      <main className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Grammar Practice
          </h1>
          <p className="text-muted-foreground text-lg">Choose your difficulty level</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => startQuiz("beginner")}>
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-green-600">Beginner</CardTitle>
              <CardDescription>Basic grammar rules and sentence structure</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Present & Past tense</li>
                <li>• Subject-verb agreement</li>
                <li>• Basic sentence formation</li>
              </ul>
              <Button className="w-full mt-4 bg-green-500 hover:bg-green-600">Start Beginner</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => startQuiz("intermediate")}>
            <CardHeader className="text-center">
              <Brain className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-primary">Intermediate</CardTitle>
              <CardDescription>Complex grammar patterns and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Conditional sentences</li>
                <li>• Passive voice</li>
                <li>• Perfect tenses</li>
              </ul>
              <Button className="w-full mt-4">Start Intermediate</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer backdrop-card" onClick={() => startQuiz("advanced")}>
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-destructive mx-auto mb-2" />
              <CardTitle className="text-destructive">Advanced</CardTitle>
              <CardDescription>Complex structures and nuanced usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complex conditionals</li>
                <li>• Subjunctive mood</li>
                <li>• Advanced verb forms</li>
              </ul>
              <Button variant="destructive" className="w-full mt-4">Start Advanced</Button>
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
          <Badge variant={selectedLevel === "beginner" ? "secondary" : selectedLevel === "intermediate" ? "default" : "destructive"}>
            {selectedLevel}
          </Badge>
          <Badge variant="outline">Score: {score}/{totalQuestions}</Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">{currentQuestionIndex + 1}/{grammarQuestions.length}</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <Card className="backdrop-card shadow-glow">
        <CardHeader>
          <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showResult ? (
            <>
              {currentQuestion.type === "multiple-choice" ? (
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="grid gap-4">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer text-lg hover:text-primary">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="answer" className="text-lg">Your Answer:</Label>
                  <Input
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="text-lg p-4"
                  />
                </div>
              )}
              
              <Button 
                onClick={handleSubmitAnswer}
                disabled={currentQuestion.type === "multiple-choice" ? !selectedOption : !userAnswer.trim()}
                className="w-full bg-gradient-primary"
              >
                Submit Answer
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-lg border-2",
                (currentQuestion.type === "fill-blank" ? userAnswer.trim().toLowerCase() : selectedOption) === currentQuestion.correctAnswer.toLowerCase()
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                  : "border-red-500 bg-red-50 dark:bg-red-950/30"
              )}>
                <div className="flex items-center gap-2 mb-3">
                  {(currentQuestion.type === "fill-blank" ? userAnswer.trim().toLowerCase() : selectedOption) === currentQuestion.correctAnswer.toLowerCase() ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <span className="font-semibold text-lg">
                    {(currentQuestion.type === "fill-blank" ? userAnswer.trim().toLowerCase() : selectedOption) === currentQuestion.correctAnswer.toLowerCase() ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p><strong>Your answer:</strong> {currentQuestion.type === "fill-blank" ? userAnswer : selectedOption}</p>
                  {(currentQuestion.type === "fill-blank" ? userAnswer.trim().toLowerCase() : selectedOption) !== currentQuestion.correctAnswer.toLowerCase() && (
                    <p><strong>Correct answer:</strong> {currentQuestion.correctAnswer}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Explanation:</h4>
                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
              </div>

              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex < grammarQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default GrammarSession;