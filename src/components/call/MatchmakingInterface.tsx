import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { Loader2, Search, X, Clock } from 'lucide-react';

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
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Finding Your Partner
        </CardTitle>
        <CardDescription>
          We're matching you with another learner at your level
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Searching...</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{formatTime(matchingTimer)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            We'll find you a match within 2 minutes
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">Level matching</Badge>
            <Badge variant="secondary">Voice quality</Badge>
            <Badge variant="secondary">Optimal pairing</Badge>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel Search
        </Button>

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Make sure your microphone is working</p>
          <p>🎯 We're finding someone at your skill level</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchmakingInterface;