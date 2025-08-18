import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { Mic, MicOff, Phone, PhoneOff, Users, Clock, Volume2 } from 'lucide-react';

interface CallInterfaceProps {
  onEndCall: () => void;
}

const CallInterface = ({ onEndCall }: CallInterfaceProps) => {
  const { 
    callStatus, 
    currentRoom, 
    participants, 
    isMuted, 
    toggleMute, 
    endCall 
  } = useVoiceCall();
  
  const [callDuration, setCallDuration] = useState(0);

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    await endCall();
    onEndCall();
  };

  if (callStatus === 'connecting') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 animate-pulse text-primary" />
            Connecting...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Establishing connection with other participants
          </p>
        </CardContent>
      </Card>
    );
  }

  if (callStatus !== 'connected' || !currentRoom) {
    return null;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice Call
            <Badge variant="secondary">{currentRoom.room_type.replace('_', '-')}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDuration(callDuration)}
          </div>
        </div>
        {currentRoom.topic && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Topic: {currentRoom.topic}</Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Participants List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Participants ({participants.length}/{currentRoom.max_participants})
          </div>
          <div className="grid gap-2">
            {participants.map((participant) => (
              <div 
                key={participant.user_id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {participant.profile.display_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{participant.profile.display_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {participant.profile.level} level
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {participant.is_muted ? (
                    <MicOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mic className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Card */}
        {currentRoom.topic && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Conversation Topic</h3>
              <p className="text-muted-foreground">{currentRoom.topic}</p>
            </CardContent>
          </Card>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleMute}
            className="rounded-full h-14 w-14"
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full h-16 w-16"
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {isMuted ? 'You are muted' : 'You are unmuted'} • Click the red button to end the call
        </p>
      </CardContent>
    </Card>
  );
};

export default CallInterface;