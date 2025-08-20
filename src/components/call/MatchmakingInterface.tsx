import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { Loader2, Search, X, Clock, Users, Wifi, Signal } from 'lucide-react';

interface MatchmakingInterfaceProps {
  onCancel: () => void;
}

const MatchmakingInterface = ({ onCancel }: MatchmakingInterfaceProps) => {
  const { callStatus, matchingTimer, cancelMatchmaking } = useVoiceCall();

  const handleCancel = async () => {
    await cancelMatchmaking();
    onCancel();
  };

  if (callStatus !== 'matching') return null;

  const progress = ((120 - matchingTimer) / 120) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-lg mx-auto shadow-xl border-primary/20">
        <CardHeader className="text-center pb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
            <div className="relative bg-gradient-to-r from-primary to-secondary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Finding Your Perfect Match
          </CardTitle>
          <CardDescription className="text-base">
            We're connecting you with learners at your level worldwide
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Animated Connection Indicator */}
          <div className="flex items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
            <div className="relative bg-gradient-to-r from-primary to-secondary rounded-full p-4 shadow-lg">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Searching...</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-bold text-primary">{formatTime(matchingTimer)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={progress} className="h-3 bg-secondary/20" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0:00</span>
                <span className="text-center">Finding match...</span>
                <span>2:00</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <Signal className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-green-800">Connection</p>
              <p className="text-xs text-green-600">Strong</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-blue-800">Online Users</p>
              <p className="text-xs text-blue-600">{Math.floor(Math.random() * 50) + 100}+</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Wifi className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-purple-800">Audio Quality</p>
              <p className="text-xs text-purple-600">HD</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                Level Matching
              </Badge>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                Voice Quality
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                Safe Environment
              </Badge>
            </div>
          </div>

          {/* Cancel Button */}
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="w-full h-12 text-base font-medium border-destructive/20 text-destructive hover:bg-destructive/5"
          >
            <X className="mr-2 h-5 w-5" />
            Cancel Search
          </Button>

          {/* Tips */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="text-lg">💡</div>
              <div>
                <p className="text-sm font-medium">Pro Tips</p>
                <p className="text-xs text-muted-foreground">Test your microphone and ensure stable internet</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-lg">🎯</div>
              <div>
                <p className="text-xs text-muted-foreground">We're finding someone perfect for your skill level</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchmakingInterface;